import mongoose from 'mongoose';
import Medication from '../models/Medication.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { google } from 'googleapis';
import twilio from 'twilio';
import nodemailer from 'nodemailer';

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// CORRECTED: Calculate reminder time function
const calculateReminderTime = (timePeriod, mealRelation, mealTimes) => {
  // Map time periods to meal times
  const mealTimeMap = {
    morning: mealTimes.breakfast || '08:00',
    afternoon: mealTimes.lunch || '13:00',
    evening: mealTimes.dinner || '19:00',
    night: mealTimes.night || '22:00'
  };

  const mealRelationOffsets = {
    before_meals: -30,
    with_meals: 0,
    after_meals: 30,
    independent_of_meals: 0
  };

  // Get base time and offset
  const baseTime = mealTimeMap[timePeriod];
  const offset = mealRelationOffsets[mealRelation] || 0;
  
  // If independent of meals, use default time period times
  if (mealRelation === 'independent_of_meals') {
    const defaultTimes = {
      morning: '08:00',
      afternoon: '14:00',
      evening: '18:00',
      night: '22:00'
    };
    return defaultTimes[timePeriod] || '12:00';
  }

  // Parse the base time
  const [hours, minutes] = baseTime.split(':').map(Number);
  
  // Apply the offset
  const totalMinutes = hours * 60 + minutes + offset;
  const finalHours = Math.floor(totalMinutes / 60) % 24;
  const finalMinutes = totalMinutes % 60;
  
  return `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
};

// Get all medications for a user
export const getMedications = catchAsync(async (req, res, next) => {
  const medications = await Medication.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .populate('userId', 'fullName email phone mealTimes notificationPreferences');

  res.status(200).json({
    success: true,
    count: medications.length,
    data: medications // Changed from 'medications' to 'data' for consistency
  });
});

// Get a single medication
export const getMedication = catchAsync(async (req, res, next) => {
  const medication = await Medication.findOne({
    _id: req.params.id,
    userId: req.user.id
  }).populate('userId', 'fullName email phone mealTimes notificationPreferences');

  if (!medication) {
    return next(new AppError('Medication not found', 404));
  }

  res.status(200).json({
    success: true,
    data: medication
  });
});

// CORRECTED: Create a new medication
export const createMedication = catchAsync(async (req, res, next) => {
  const {
    drugType,
    drugSubcategory,
    name,
    dosage,
    quantity,
    timePeriods,
    mealRelation,
    notes,
    reminderSettings,
    frequency,
    reminderDays
  } = req.body;

  // Validation
  if (!name || !dosage || !timePeriods || timePeriods.length === 0) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Get user's meal times
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const mealTimes = user.mealTimes || {
    breakfast: "08:00",
    lunch: "13:00",
    dinner: "19:00",
    night: "22:00"
  };

  // Calculate reminder times - THIS IS THE KEY FIX
  const reminders = timePeriods.map(period => ({
    period,
    time: calculateReminderTime(period, mealRelation, mealTimes)
  }));

  console.log('Calculated reminders:', reminders); // Debug log

  const medication = await Medication.create({
    userId: req.user.id,
    drugType,
    drugSubcategory,
    name,
    dosage,
    quantity,
    timePeriods,
    mealRelation,
    notes,
    reminderSettings: reminderSettings || {
      calendarEnabled: true,
      smsEnabled: true,
      emailEnabled: true,
      phoneCallEnabled: false
    },
    frequency: frequency || {
      type: 'daily',
      interval: 1,
      duration: 30
    },
    reminderDays: reminderDays || 7,
    reminders, // Store calculated reminder times
    mealTimesSnapshot: mealTimes
  });

  // Populate user data
  await medication.populate('userId', 'fullName email phone mealTimes notificationPreferences');

  console.log('Created medication with reminders:', medication.reminders); // Debug log

  res.status(201).json({
    success: true,
    message: 'Medication added successfully',
    data: medication
  });
});

// Update a medication
export const updateMedication = catchAsync(async (req, res, next) => {
  // If timePeriods or mealRelation changed, recalculate reminder times
  if (req.body.timePeriods || req.body.mealRelation) {
    const user = await User.findById(req.user.id);
    const mealTimes = user.mealTimes || {
      breakfast: "08:00",
      lunch: "13:00", 
      dinner: "19:00",
      night: "22:00"
    };

    const timePeriods = req.body.timePeriods;
    const mealRelation = req.body.mealRelation;

    if (timePeriods && mealRelation) {
      req.body.reminders = timePeriods.map(period => ({
        period,
        time: calculateReminderTime(period, mealRelation, mealTimes)
      }));
    }
  }

  const medication = await Medication.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  ).populate('userId', 'fullName email phone mealTimes notificationPreferences');

  if (!medication) {
    return next(new AppError('Medication not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Medication updated successfully',
    data: medication
  });
});

// Delete a medication
export const deleteMedication = catchAsync(async (req, res, next) => {
  const medication = await Medication.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!medication) {
    return next(new AppError('Medication not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Medication deleted successfully'
  });
});

// IMPROVED: Google Calendar sync with proper OAuth flow simulation
export const syncGoogleCalendar = catchAsync(async (req, res, next) => {
  const { medications } = req.body;
  const user = await User.findById(req.user.id);

  if (!user.email) {
    return next(new AppError('Please add your email to sync with Google Calendar', 400));
  }

  if (!medications || medications.length === 0) {
    return next(new AppError('No medications provided for sync', 400));
  }

  try {
    const events = [];
    const currentDate = new Date();
    
    for (const medication of medications) {
      if (!medication.reminderSettings?.calendarEnabled) continue;
      
      // Calculate end date based on reminderDays
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + (medication.reminderDays || 30));
      
      // Create events for each reminder time
      for (const reminder of medication.reminders || []) {
        const event = {
          summary: `Medication: ${medication.name}`,
          description: `Take ${medication.quantity} ${medication.dosage}\n\nNotes: ${medication.notes || 'None'}\nMeal relation: ${medication.mealRelation?.replace('_', ' ') || 'N/A'}\nDuration: ${medication.reminderDays || 30} days`,
          start: {
            dateTime: `${new Date().toISOString().split('T')[0]}T${reminder.time}:00`,
            timeZone: 'Asia/Colombo'
          },
          end: {
            dateTime: `${endDate.toISOString().split('T')[0]}T${reminder.time}:00`,
            timeZone: 'Asia/Colombo'
          },
          recurrence: [`RRULE:FREQ=DAILY;COUNT=${medication.reminderDays || 30}`],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 10 },
              { method: 'popup', minutes: 5 }
            ]
          }
        };
        
        events.push(event);
        console.log(`Calendar event created for ${medication.name} at ${reminder.time} for ${medication.reminderDays || 30} days`);
      }
    }

    // In a real implementation, you would use Google Calendar API here
    // For now, we simulate success and provide instructions
    
    res.status(200).json({
      success: true,
      message: `Calendar sync prepared for ${events.length} events`,
      events: events,
      instructions: {
        step1: "Visit Google Calendar (calendar.google.com)",
        step2: "Click the '+' button to create new events",
        step3: "Use the event details provided in the response",
        step4: "Set up recurring reminders for daily medication",
        note: "In production, this would automatically create events using Google Calendar API with OAuth2"
      }
    });
  } catch (error) {
    console.error('Google Calendar sync error:', error);
    return next(new AppError('Failed to prepare calendar sync: ' + error.message, 500));
  }
});

// CORRECTED: Schedule SMS reminders
export const scheduleSMS = catchAsync(async (req, res, next) => {
  const { medications } = req.body;
  const user = await User.findById(req.user.id);

  if (!user.phone) {
    return next(new AppError('Please add your phone number to receive SMS reminders', 400));
  }

  if (!medications || medications.length === 0) {
    return next(new AppError('No medications provided for SMS scheduling', 400));
  }

  try {
    const scheduledReminders = [];
    
    for (const medication of medications) {
      if (!medication.reminderSettings?.smsEnabled) continue;
      
      for (const reminder of medication.reminders || []) {
        const message = `🏥 MEDICATION REMINDER 🏥\n\nTime to take: ${medication.name}\nDosage: ${medication.quantity} ${medication.dosage}\nTime: ${reminder.time}\n\n${medication.notes ? 'Notes: ' + medication.notes : ''}`;
        
        // For testing purposes, send one immediate SMS
        try {
          const smsResult = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: user.phone
          });
          
          console.log(`SMS sent successfully: ${smsResult.sid}`);
          
          scheduledReminders.push({
            medication: medication.name,
            time: reminder.time,
            phone: user.phone,
            status: 'sent',
            sid: smsResult.sid
          });
        } catch (smsError) {
          console.error('SMS sending error:', smsError);
          scheduledReminders.push({
            medication: medication.name,
            time: reminder.time,
            phone: user.phone,
            status: 'failed',
            error: smsError.message
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `SMS reminders processed for ${scheduledReminders.length} medications`,
      scheduledReminders,
      note: 'Test SMS sent immediately. In production, these would be scheduled for the specified times.'
    });
  } catch (error) {
    console.error('SMS scheduling error:', error);
    return next(new AppError('Failed to schedule SMS reminders: ' + error.message, 500));
  }
});

// CORRECTED: Schedule email reminders
export const scheduleEmailReminders = catchAsync(async (req, res, next) => {
  const { medications } = req.body;
  const user = await User.findById(req.user.id);

  if (!user.email) {
    return next(new AppError('Please add your email to receive email reminders', 400));
  }

  if (!medications || medications.length === 0) {
    return next(new AppError('No medications provided for email scheduling', 400));
  }

  try {
    const scheduledReminders = [];
    
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured. Skipping actual email sending.');
      
      // Still return success for testing purposes
      for (const medication of medications) {
        if (!medication.reminderSettings?.emailEnabled) continue;
        
        for (const reminder of medication.reminders || []) {
          scheduledReminders.push({
            medication: medication.name,
            time: reminder.time,
            email: user.email,
            status: 'simulated - email not configured'
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Email reminders would be scheduled (email not configured)',
        scheduledReminders,
        emailSent: false,
        note: 'Email credentials not configured. Set EMAIL_USER and EMAIL_PASS environment variables.'
      });
    }

    // Send a summary email immediately for testing
    const medicationsList = medications
      .filter(med => med.reminderSettings?.emailEnabled)
      .map(med => `
        <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
          <h3 style="color: #2196F3; margin: 0 0 10px 0;">${med.name}</h3>
          <p><strong>Quantity:</strong> ${med.quantity} </p>
          <p><strong>Dosage:</strong>  ${med.dosage}</p>
          <p><strong>Times:</strong> ${med.reminders?.map(r => `${r.period} (${r.time})`).join(', ')}</p>
          <p><strong>Meal Relation:</strong> ${med.mealRelation?.replace('_', ' ') || 'N/A'}</p>
          ${med.notes ? `<p><strong>Notes:</strong> ${med.notes}</p>` : ''}
        </div>
      `).join('');

    const mailOptions = {
      from: `"Medical Reminder System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '💊 Your Medication Schedule is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%); color: white; padding: 20px; text-align: center;">
            <h1>Smart Medical Reminder System</h1>
            <p>Your medication reminders have been set up successfully!</p>
          </div>
          
          <div style="padding: 20px;">
            <h2 style="color: #333;">Hello ${user.fullName},</h2>
            <p>Your medication schedule has been configured. Here are your active medications:</p>
            
            ${medicationsList}
            
            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2196F3;">Reminder Settings</h3>
              <ul>
                <li>📧 Email reminders: Enabled</li>
                <li>📱 SMS reminders: ${user.phone ? 'Enabled' : 'Disabled (no phone number)'}</li>
                <li>📅 Calendar sync: Available</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              This is a test email. In production, you'll receive individual reminders at the scheduled times.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #999;">Stay healthy! 🏥</p>
            </div>
          </div>
        </div>
      `
    };

    const emailResult = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', emailResult.messageId);

    for (const medication of medications) {
      if (!medication.reminderSettings?.emailEnabled) continue;
      
      for (const reminder of medication.reminders || []) {
        scheduledReminders.push({
          medication: medication.name,
          time: reminder.time,
          email: user.email,
          status: 'scheduled'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Email reminders scheduled successfully',
      scheduledReminders,
      emailSent: true,
      messageId: emailResult.messageId,
      note: 'Test email sent immediately. In production, individual reminders would be sent at scheduled times.'
    });
  } catch (error) {
    console.error('Email scheduling error:', error);
    
    // More detailed error response
    return next(new AppError(`Failed to schedule email reminders: ${error.message}`, 500));
  }
});

// Get medications due for reminders - CORRECTED
export const getDueMedications = catchAsync(async (req, res, next) => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  console.log('Checking for medications due at:', currentTime); // Debug log
  
  const medications = await Medication.getMedicationsDueForReminder(currentTime);
  
  console.log(`Found ${medications.length} medications due for reminders`); // Debug log

  res.status(200).json({
    success: true,
    count: medications.length,
    currentTime,
    data: medications
  });
});

// Update adherence tracking
export const updateAdherence = catchAsync(async (req, res, next) => {
  const { medicationId, timePeriod, taken, notes } = req.body;

  const medication = await Medication.findOne({
    _id: medicationId,
    userId: req.user.id
  });

  if (!medication) {
    return next(new AppError('Medication not found', 404));
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Check if there's already an entry for today
  const existingEntryIndex = medication.adherenceLog.findIndex(entry => 
    entry.date.toISOString().split('T')[0] === today && entry.timePeriod === timePeriod
  );

  if (existingEntryIndex >= 0) {
    // Update existing entry
    medication.adherenceLog[existingEntryIndex].taken = taken;
    medication.adherenceLog[existingEntryIndex].takenAt = taken ? new Date() : null;
    medication.adherenceLog[existingEntryIndex].notes = notes || '';
  } else {
    // Add new entry
    medication.adherenceLog.push({
      date: new Date(),
      timePeriod,
      taken,
      takenAt: taken ? new Date() : null,
      notes: notes || ''
    });
  }

  await medication.save();

  res.status(200).json({
    success: true,
    message: 'Adherence updated successfully',
    data: medication.adherenceLog
  });
});

// Get adherence statistics
export const getAdherenceStats = catchAsync(async (req, res, next) => {
  const { days = 30 } = req.query;

  const medications = await Medication.find({
    userId: req.user.id,
    isActive: true
  });

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const stats = {
    totalMedications: medications.length,
    adherenceRate: 0,
    missedDoses: 0,
    takenDoses: 0,
    byMedication: [],
    byDay: []
  };

  for (const medication of medications) {
    const medicationStats = {
      name: medication.name,
      totalDoses: 0,
      takenDoses: 0,
      missedDoses: 0,
      adherenceRate: 0
    };

    const relevantLogs = medication.adherenceLog.filter(entry => 
      entry.date >= startDate
    );

    medicationStats.totalDoses = relevantLogs.length;
    medicationStats.takenDoses = relevantLogs.filter(entry => entry.taken).length;
    medicationStats.missedDoses = medicationStats.totalDoses - medicationStats.takenDoses;
    medicationStats.adherenceRate = medicationStats.totalDoses > 0 ? 
      (medicationStats.takenDoses / medicationStats.totalDoses) * 100 : 0;

    stats.byMedication.push(medicationStats);
    
    stats.takenDoses += medicationStats.takenDoses;
    stats.missedDoses += medicationStats.missedDoses;
  }

  stats.totalDoses = stats.takenDoses + stats.missedDoses;
  stats.adherenceRate = stats.totalDoses > 0 ? 
    (stats.takenDoses / stats.totalDoses) * 100 : 0;

  // Generate daily stats
  for (let i = 0; i < parseInt(days); i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    let dayTaken = 0;
    let dayMissed = 0;

    medications.forEach(medication => {
      medication.adherenceLog.forEach(entry => {
        if (entry.date.toISOString().split('T')[0] === dateStr) {
          if (entry.taken) dayTaken++;
          else dayMissed++;
        }
      });
    });

    stats.byDay.unshift({
      date: dateStr,
      taken: dayTaken,
      missed: dayMissed,
      total: dayTaken + dayMissed
    });
  }

  res.status(200).json({
    success: true,
    data: stats
  });
});