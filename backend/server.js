import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { twilioClient, transporter } from './services/notificationService.js';

import connectDB from './config/db.js';
import globalErrorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import Medication from './models/Medication.js';
import User from './models/User.js';
import doctorRoutes from './routes/doctorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dietPlanRoutes from './routes/dietPlanRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB
connectDB();



// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(morgan('combined'));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    services: {
      twilio: !!twilioClient,
      email: !!transporter,
      database: true
    }
  });
});


// Routes
app.use('/api/diet-plans', dietPlanRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api', profileRoutes);
app.use('/api', doctorRoutes);
app.use('/api/admin', adminRoutes);



// CORRECTED: Schedule reminder checks every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    console.log(`🔍 Running medication reminder check at ${currentTime}...`);
    
    // Find medications due for reminders using the corrected query
    const medications = await Medication.getMedicationsDueForReminder(currentTime);
    
    console.log(`📋 Found ${medications.length} medications due for reminders`);

    for (const medication of medications) {
      const user = medication.userId;
      
      if (!user) {
        console.log(`⚠️ No user found for medication: ${medication.name}`);
        continue;
      }

      // Check if medication is still within reminder days period
      const medicationStartDate = new Date(medication.startDate);
      const daysSinceStart = Math.floor((now - medicationStartDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceStart > (medication.reminderDays || 7)) {
        console.log(`⏰ Medication ${medication.name} has exceeded reminder period (${daysSinceStart} days)`);
        continue;
      }

      console.log(`📞 Processing reminders for ${user.fullName} - ${medication.name} (Day ${daysSinceStart + 1} of ${medication.reminderDays || 7})`);

      // Send SMS if enabled and user has phone number
      if (medication.reminderSettings?.smsEnabled && 
          user.notificationPreferences?.sms && 
          user.phone && 
          twilioClient) {
        try {
          const message = `💊 MEDICATION REMINDER\n\nTime to take: ${medication.name}\nDosage: ${medication.quantity} ${medication.dosage}\nTime: ${currentTime}\n\n${medication.notes ? 'Notes: ' + medication.notes : 'Stay healthy!'}`;
          
          const smsResult = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: user.phone
          });
          
          console.log(`✅ SMS sent to ${user.phone} for ${medication.name} - SID: ${smsResult.sid}`);
        } catch (error) {
          console.error(`❌ Failed to send SMS to ${user.phone}:`, error.message);
        }
      }

      // Send email if enabled and user has email
      if (medication.reminderSettings?.emailEnabled && 
          user.notificationPreferences?.email && 
          user.email && 
          transporter) {
        try {
          const mailOptions = {
            from: `"${process.env.FROM_NAME || 'Smart Medical Reminder'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `💊 Medication Reminder: ${medication.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%); color: white; padding: 20px; text-align: center;">
                  <h2 style="margin: 0;">⏰ Medication Reminder</h2>
                </div>
                <div style="padding: 20px;">
                  <h3 style="color: #2196F3; margin: 0 0 15px 0;">Time to take your medication!</h3>
                  
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><strong>Medication:</strong> ${medication.name}</p>
                    <p style="margin: 5px 0;"><strong>Quantity:</strong> ${medication.quantity} </p>
                    <p style="margin: 5px 0;"><strong>Dosage:</strong> ${medication.dosage}</p>
                    <p style="margin: 5px 0;"><strong>Time:</strong> ${currentTime}</p>
                    <p style="margin: 5px 0;"><strong>Meal Relation:</strong> ${medication.mealRelation?.replace('_', ' ') || 'N/A'}</p>
                    ${medication.notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${medication.notes}</p>` : ''}
                  </div>
                  
                  <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
                    Remember to take your medication as prescribed. Stay healthy!
                  </p>
                </div>
              </div>
            `
          };

          const emailResult = await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent to ${user.email} for ${medication.name} - ID: ${emailResult.messageId}`);
        } catch (error) {
          console.error(`❌ Failed to send email to ${user.email}:`, error.message);
        }
      }

      // Update last reminder sent
      medication.lastReminderSent = new Date();
      await medication.save();
      console.log(`✅ Updated lastReminderSent for ${medication.name}`);
    }

    if (medications.length === 0) {
      console.log(`ℹ️ No medications due for reminders at ${currentTime}`);
    }
  } catch (error) {
    console.error('❌ Error in reminder cron job:', error);
  }
});

// IMPROVED: Schedule daily summary at 7 AM
cron.schedule('0 7 * * *', async () => {
  try {
    console.log('📧 Running daily medication summary...');
    
    const users = await User.find({
      'notificationPreferences.email': true,
      email: { $exists: true, $ne: null },
      isActive: true
    });

    console.log(`📬 Found ${users.length} users for daily summary`);

    for (const user of users) {
      try {
        const medications = await Medication.find({
          userId: user._id,
          isActive: true
        });

        if (medications.length === 0) {
          console.log(`ℹ️ No active medications for user: ${user.fullName}`);
          continue;
        }

        const medicationsList = medications.map(med => {
          const reminderTimes = med.reminders?.map(r => `${r.period} (${r.time})`).join(', ') || 'No times set';
          return `
            <div style="border-left: 4px solid #2196F3; padding: 10px; margin: 10px 0; background: #f8f9fa;">
              <h4 style="margin: 0 0 8px 0; color: #2196F3;">${med.name}</h4>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Dosage:</strong> ${med.quantity} ${med.dosage}</p>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Times:</strong> ${reminderTimes}</p>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Meal Relation:</strong> ${med.mealRelation?.replace('_', ' ') || 'N/A'}</p>
              ${med.notes ? `<p style="margin: 2px 0; font-size: 12px; color: #666;"><em>${med.notes}</em></p>` : ''}
            </div>
          `;
        }).join('');

        const mailOptions = {
          from: `"${process.env.FROM_NAME || 'Smart Medical Reminder'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
          to: user.email,
          subject: '📅 Your Daily Medication Schedule',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%); color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">📅 Daily Medication Schedule</h1>
                <p style="margin: 10px 0 0 0;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              
              <div style="padding: 20px;">
                <h2 style="color: #333;">Good morning, ${user.fullName}!</h2>
                <p>Here's your medication schedule for today:</p>
                
                ${medicationsList}
                
                <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                  <p style="margin: 0; color: #1976d2; font-weight: bold;">💡 Remember to take your medications as scheduled</p>
                  <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">You'll receive individual reminders throughout the day</p>
                </div>
                
                <p style="color: #666; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
                  Have a healthy day! 🌟
                </p>
              </div>
            </div>
          `
        };

        if (transporter) {
          const emailResult = await transporter.sendMail(mailOptions);
          console.log(`✅ Daily summary sent to ${user.fullName} (${user.email}) - ID: ${emailResult.messageId}`);
        }
      } catch (userError) {
        console.error(`❌ Failed to send daily summary to ${user.fullName}:`, userError.message);
      }
    }
  } catch (error) {
    console.error('❌ Error in daily summary cron job:', error);
  }
});

// Test cron job to verify functionality (runs every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    const medicationCount = await Medication.countDocuments({ isActive: true });
    const userCount = await User.countDocuments({ isActive: true });
    
    console.log(`🔄 System Status Check - ${now.toLocaleTimeString()}`);
    console.log(`📊 Active medications: ${medicationCount}, Active users: ${userCount}`);
    console.log(`🌐 Services: Twilio=${!!twilioClient}, Email=${!!transporter}`);
  } catch (error) {
    console.error('❌ Error in status check:', error);
  }
});

// Global error handler
app.use(globalErrorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📧 Email service: ${transporter ? 'Active' : 'Inactive'}`);
  console.log(`📱 SMS service: ${twilioClient ? 'Active' : 'Inactive'}`);
  console.log(`⏰ Cron jobs: Medication reminders (every minute), Daily summary (7 AM)`);
});

export default app;