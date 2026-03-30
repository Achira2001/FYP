import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { transporter, sendSMS, smsReady, checkSMSBalance } from './services/notificationService.js';

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
import notificationRoutes from './routes/notificationRoutes.js';
import { apiLimiter, notificationLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

connectDB();

app.use(cors({
  origin:      ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  Health check 
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success:   true,
    message:   'Server is running',
    timestamp: new Date().toISOString(),
    services: {
      sms:      smsReady(),      
      email:    !!transporter,
      database: true
    }
  });
});

//  Rate limiting 
app.use('/api',              apiLimiter);
app.use('/api/notifications', notificationLimiter);

//  Routes 
app.use('/api/diet-plans',     dietPlanRoutes);
app.use('/api/auth',           authRoutes);
app.use('/api/auth',           googleAuthRoutes);
app.use('/api/medications',    medicationRoutes);
app.use('/api/users',          userRoutes);
app.use('/api/profile',        profileRoutes);
app.use('/api/admin',          adminRoutes);
app.use('/api/notifications',  notificationRoutes);
app.use('/api',                doctorRoutes);   


// CRON: Medication reminders — runs every minute
cron.schedule('* * * * *', async () => {
  try {
    const now         = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    console.log(` Reminder check at ${currentTime}...`);

    const medications = await Medication.getMedicationsDueForReminder(currentTime);
    console.log(` ${medications.length} medication(s) due`);

    for (const medication of medications) {
      const user = medication.userId;
      if (!user) { console.log(` No user for: ${medication.name}`); continue; }

      // Find the specific reminder(s) matching currentTime
      const dueReminders = medication.reminders.filter(r => r.time === currentTime);
      if (!dueReminders.length) continue;

      const daysSinceStart  = Math.floor((now - new Date(medication.startDate)) / (1000 * 60 * 60 * 24));
      const maxReminderDays = medication.reminderDays || 30;

      if (daysSinceStart > maxReminderDays) {
        console.log(`  ${medication.name} — past reminder window (${daysSinceStart}/${maxReminderDays} days)`);
        continue;
      }

      for (const reminder of dueReminders) {
        console.log(` Reminding ${user.fullName} → ${medication.name} @ ${reminder.period} (${reminder.time}) Day ${daysSinceStart + 1}/${maxReminderDays}`);

        //  SMS 
        const smsAllowed =
          medication.reminderSettings?.smsEnabled !== false &&
          user.notificationPreferences?.sms !== false &&
          user.phone &&
          smsReady();

        if (smsAllowed) {
          const smsResult = await sendSMS({
            to:      user.phone,
            message: `\u25CF MEDICATION REMINDER\n\nTime to take: ${medication.name}\nDosage: ${medication.quantity} ${medication.dosage}\nPeriod: ${reminder.period} (${reminder.time})\n\n${medication.notes ? 'Notes: ' + medication.notes : 'Stay healthy!'}`
          });
          console.log(smsResult.success ? ` SMS sent to ${user.phone}` : ` SMS failed: ${smsResult.reason}`);
        }

        //  Email 
        const emailAllowed =
          medication.reminderSettings?.emailEnabled !== false &&
          user.notificationPreferences?.email !== false &&
          user.email &&
          transporter;

        if (emailAllowed) {
          try {
            await transporter.sendMail({
              from:    `"${process.env.FROM_NAME || 'Smart Medical Reminder'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
              to:      user.email,
              subject: `\u25CF Medication Reminder: ${medication.name} (${reminder.period})`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                  <div style="background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%); color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">&#9679 Medication Reminder</h2>
                  </div>
                  <div style="padding: 20px;">
                    <h3 style="color: #2196F3; margin: 0 0 15px 0;">Time to take your medication!</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                      <p style="margin: 5px 0;"><strong>Medication:</strong> ${medication.name}</p>
                      <p style="margin: 5px 0;"><strong>Quantity:</strong> ${medication.quantity}</p>
                      <p style="margin: 5px 0;"><strong>Dosage:</strong> ${medication.dosage}</p>
                      <p style="margin: 5px 0;"><strong>Period:</strong> ${reminder.period} at ${reminder.time}</p>
                      <p style="margin: 5px 0;"><strong>Meal Relation:</strong> ${medication.mealRelation?.replace(/_/g, ' ') || 'N/A'}</p>
                      ${medication.notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${medication.notes}</p>` : ''}
                    </div>
                  </div>
                </div>
              `
            });
            console.log(` Email sent to ${user.email} for ${medication.name} (${reminder.period})`);
          } catch (error) {
            console.error(` Email failed to ${user.email}:`, error.message);
          }
        }
      }

      // Update lastReminderSent ONCE per medication per cron tick
      medication.lastReminderSent = new Date();
      await medication.save();
    }

    if (!medications.length) console.log(`  No medications due at ${currentTime}`);

  } catch (error) {
    console.error(' Cron job error:', error);
  }
});


// CRON: Daily summary email at 7 AM

cron.schedule('0 7 * * *', async () => {
  try {
    console.log(' Running daily medication summary...');

    const users = await User.find({
      'notificationPreferences.email': true,
      email:    { $exists: true, $ne: null },
      isActive: true
    });

    for (const user of users) {
      try {
        const medications = await Medication.find({ userId: user._id, isActive: true });
        if (!medications.length) continue;

        const medList = medications.map(med => {
          const times = med.reminders?.map(r => `${r.period} (${r.time})`).join(', ') || 'No times set';
          return `
            <div style="border-left: 4px solid #2196F3; padding: 10px; margin: 10px 0; background: #f8f9fa;">
              <h4 style="margin: 0 0 8px 0; color: #2196F3;">${med.name}</h4>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Dosage:</strong> ${med.quantity} ${med.dosage}</p>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Times:</strong> ${times}</p>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Meal Relation:</strong> ${med.mealRelation?.replace(/_/g, ' ') || 'N/A'}</p>
              ${med.notes ? `<p style="margin: 2px 0; font-size: 12px; color: #666;"><em>${med.notes}</em></p>` : ''}
            </div>
          `;
        }).join('');

        if (transporter) {
          await transporter.sendMail({
            from:    `"${process.env.FROM_NAME || 'Smart Medical Reminder'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
            to:      user.email,
            subject: '[SCHEDULE] Your Daily Medication Schedule',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%); color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0;">&#9632; Daily Medication Schedule</h1>
                  <p style="margin: 10px 0 0 0;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div style="padding: 20px;">
                  <h2 style="color: #333;">Good morning, ${user.fullName}!</h2>
                  <p>Here's your medication schedule for today:</p>
                  ${medList}
                  <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; color: #1976d2; font-weight: bold;">💡 Remember to take your medications as scheduled</p>
                  </div>
                </div>
              </div>
            `
          });
          console.log(` Daily summary -> ${user.fullName} (${user.email})`);
        }
      } catch (err) {
        console.error(` Daily summary failed for ${user.fullName}:`, err.message);
      }
    }
  } catch (error) {
    console.error(' Daily summary cron error:', error);
  }
});


// CRON: System status every 5 minutes

cron.schedule('*/5 * * * *', async () => {
  try {
    const medCount  = await Medication.countDocuments({ isActive: true });
    const userCount = await User.countDocuments({ isActive: true });
    console.log(` Status — ${new Date().toLocaleTimeString()} | Meds: ${medCount} | Users: ${userCount} | SMS (Text.lk): ${smsReady() ? '[Ok]' : '[Error]'} | Email: ${!!transporter}`);
  } catch (error) {
    console.error(' Status check error:', error);
  }
});

// Error handlers 
app.use(globalErrorHandler);
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

//Graceful shutdown 
process.on('SIGTERM', () => { console.log(' SIGTERM'); process.exit(0); });
process.on('SIGINT',  () => { console.log(' SIGINT');  process.exit(0); });

//  Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' MEDIVA SERVER STARTED');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(` Port: ${PORT}  |  ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Email: ${transporter ? '[OK]' : '[FAIL]'}  |   SMS (Text.lk): ${smsReady() ? '[OK]' : '[FAIL]'}`);
  console.log('═══════════════════════════════════════════════════════════');
  if (smsReady()) await checkSMSBalance();
});

export default app;