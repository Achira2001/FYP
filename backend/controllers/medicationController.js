import Medication from '../models/Medication.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { sendSMS, sendEmail, smsReady, transporter } from '../services/notificationService.js';

// ─────────────────────────────────────────────
// HELPER: Calculate exact reminder time
// ─────────────────────────────────────────────
const calculateReminderTime = (timePeriod, mealRelation, mealTimes) => {
  const mealTimeMap = {
    morning:   mealTimes.breakfast || '08:00',
    afternoon: mealTimes.lunch     || '13:00',
    evening:   mealTimes.dinner    || '19:00',
    night:     mealTimes.night     || '22:00'
  };

  const offsets = {
    before_meals:          -30,
    with_meals:              0,
    after_meals:            30,
    independent_of_meals: null
  };

  if (mealRelation === 'independent_of_meals') {
    return { morning: '08:00', afternoon: '14:00', evening: '18:00', night: '22:00' }[timePeriod] || '12:00';
  }

  const baseTime  = mealTimeMap[timePeriod];
  const offset    = offsets[mealRelation] ?? 0;
  const [h, m]    = baseTime.split(':').map(Number);
  const total     = h * 60 + m + offset;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

// ═══════════════════════════════════════════════════════════════
// GET ALL MEDICATIONS  GET /api/medications
// ═══════════════════════════════════════════════════════════════
export const getMedications = catchAsync(async (req, res, next) => {
  const medications = await Medication.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .populate('userId', 'fullName email phone mealTimes notificationPreferences');

  res.status(200).json({ success: true, count: medications.length, data: medications });
});

// ═══════════════════════════════════════════════════════════════
// GET SINGLE MEDICATION  GET /api/medications/:id
// ═══════════════════════════════════════════════════════════════
export const getMedication = catchAsync(async (req, res, next) => {
  const medication = await Medication.findOne({ _id: req.params.id, userId: req.user.id })
    .populate('userId', 'fullName email phone mealTimes notificationPreferences');

  if (!medication) return next(new AppError('Medication not found', 404));

  res.status(200).json({ success: true, data: medication });
});

// ═══════════════════════════════════════════════════════════════
// CREATE MEDICATION  POST /api/medications
// ═══════════════════════════════════════════════════════════════
export const createMedication = catchAsync(async (req, res, next) => {
  const {
    drugType, drugSubcategory, name, dosage, quantity,
    timePeriods, mealRelation, notes, reminderSettings,
    frequency, reminderDays
  } = req.body;

  if (!name || !dosage || !timePeriods?.length) {
    return next(new AppError('Please provide name, dosage, and at least one time period', 400));
  }

  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  const mealTimes = user.mealTimes || { breakfast: '08:00', lunch: '13:00', dinner: '19:00', night: '22:00' };

  const reminders = timePeriods.map(period => ({
    period,
    time: calculateReminderTime(period, mealRelation, mealTimes)
  }));

  const medication = await Medication.create({
    userId: req.user.id,
    drugType, drugSubcategory, name, dosage, quantity,
    timePeriods, mealRelation, notes,
    reminderSettings: reminderSettings || {
      calendarEnabled: true, smsEnabled: true,
      emailEnabled:    true, phoneCallEnabled: false
    },
    frequency: frequency || { type: 'daily', interval: 1, duration: 30 },
    reminderDays: reminderDays || 7,
    reminders,
    mealTimesSnapshot: mealTimes
  });

  await medication.populate('userId', 'fullName email phone mealTimes notificationPreferences');

  console.log(`✅ Medication created: ${name} | Reminders: ${reminders.map(r => r.time).join(', ')}`);

  res.status(201).json({
    success: true,
    message: 'Medication added successfully',
    data:    medication
  });
});

// ═══════════════════════════════════════════════════════════════
// UPDATE MEDICATION  PUT /api/medications/:id
// ═══════════════════════════════════════════════════════════════
export const updateMedication = catchAsync(async (req, res, next) => {
  if (req.body.timePeriods || req.body.mealRelation) {
    const user      = await User.findById(req.user.id);
    const mealTimes = user.mealTimes || { breakfast: '08:00', lunch: '13:00', dinner: '19:00', night: '22:00' };
    const periods   = req.body.timePeriods;
    const relation  = req.body.mealRelation;

    if (periods && relation) {
      req.body.reminders = periods.map(period => ({
        period,
        time: calculateReminderTime(period, relation, mealTimes)
      }));
    }
  }

  const medication = await Medication.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  ).populate('userId', 'fullName email phone mealTimes notificationPreferences');

  if (!medication) return next(new AppError('Medication not found', 404));

  res.status(200).json({ success: true, message: 'Medication updated successfully', data: medication });
});

// ═══════════════════════════════════════════════════════════════
// DELETE MEDICATION  DELETE /api/medications/:id
// ═══════════════════════════════════════════════════════════════
export const deleteMedication = catchAsync(async (req, res, next) => {
  const medication = await Medication.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!medication) return next(new AppError('Medication not found', 404));

  res.status(200).json({ success: true, message: 'Medication deleted successfully' });
});

// ═══════════════════════════════════════════════════════════════
// GOOGLE CALENDAR SYNC  POST /api/medications/sync/google-calendar
// ═══════════════════════════════════════════════════════════════
export const syncGoogleCalendar = catchAsync(async (req, res, next) => {
  const { medications } = req.body;
  const user = await User.findById(req.user.id);

  if (!user.email) return next(new AppError('Please add your email to sync with Google Calendar', 400));
  if (!medications?.length) return next(new AppError('No medications provided for sync', 400));

  const events      = [];
  const currentDate = new Date();

  for (const medication of medications) {
    if (!medication.reminderSettings?.calendarEnabled) continue;

    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + (medication.reminderDays || 30));

    for (const reminder of medication.reminders || []) {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const startTime = new Date(currentDate);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);

      events.push({
        summary:     `💊 Take ${medication.name}`,
        description: `Medication: ${medication.name}\nDosage: ${medication.quantity} ${medication.dosage}\nMeal Relation: ${medication.mealRelation?.replace(/_/g, ' ') || 'N/A'}${medication.notes ? '\nNotes: ' + medication.notes : ''}`,
        start:       { dateTime: startTime.toISOString(), timeZone: 'Asia/Colombo' },
        end:         { dateTime: endTime.toISOString(), timeZone: 'Asia/Colombo' },
        recurrence:  [`RRULE:FREQ=DAILY;UNTIL=${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`]
      });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Calendar events prepared',
    events,
    note:    'Integrate with Google Calendar OAuth to push these events directly.'
  });
});

// ═══════════════════════════════════════════════════════════════
// SCHEDULE SMS  POST /api/medications/schedule/sms
// ═══════════════════════════════════════════════════════════════
export const scheduleSMS = catchAsync(async (req, res, next) => {
  const { medications } = req.body;
  const user = await User.findById(req.user.id);

  if (!user.phone) {
    return next(new AppError('Please add your phone number to schedule SMS reminders', 400));
  }

  if (!smsReady()) {
    return res.status(200).json({
      success: true,
      message: 'SMS reminders would be scheduled (Text.lk API key not configured)',
      note:    'Sign up free at https://app.text.lk/register, get your API key, and add TEXTLK_API_KEY to .env',
      smsSent: false
    });
  }

  const scheduledReminders = [];
  for (const medication of medications) {
    if (!medication.reminderSettings?.smsEnabled) continue;
    for (const reminder of medication.reminders || []) {
      scheduledReminders.push({ medication: medication.name, time: reminder.time, phone: user.phone, status: 'scheduled' });
    }
  }

  // Send a confirmation SMS immediately
  const testMsg = `💊 MedReminder Setup Complete!\n\nYour SMS reminders are active for:\n${medications.map(m => `• ${m.name} (${m.dosage})`).join('\n')}\n\nStay healthy!`;
  const smsResult = await sendSMS({ to: user.phone, message: testMsg });

  res.status(200).json({
    success:            true,
    message:            smsResult.success ? 'SMS reminders scheduled. Confirmation SMS sent!' : 'SMS reminders scheduled (confirmation SMS failed).',
    scheduledReminders,
    smsSent:            smsResult.success,
    smsDetails:         smsResult
  });
});

// ═══════════════════════════════════════════════════════════════
// SCHEDULE EMAIL REMINDERS  POST /api/medications/schedule/email
// ═══════════════════════════════════════════════════════════════
export const scheduleEmailReminders = catchAsync(async (req, res, next) => {
  const { medications } = req.body;
  const user = await User.findById(req.user.id);

  if (!user.email) return next(new AppError('Please add your email to schedule email reminders', 400));

  const scheduledReminders = [];

  if (!transporter) {
    for (const med of medications) {
      if (!med.reminderSettings?.emailEnabled) continue;
      for (const r of med.reminders || []) {
        scheduledReminders.push({ medication: med.name, time: r.time, email: user.email, status: 'simulated - email not configured' });
      }
    }
    return res.status(200).json({
      success:            true,
      message:            'Email reminders would be scheduled (email not configured)',
      scheduledReminders,
      emailSent:          false,
      note:               'Set EMAIL_USER and EMAIL_PASS in .env'
    });
  }

  const medList = medications
    .filter(m => m.reminderSettings?.emailEnabled)
    .map(m => `
      <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
        <h3 style="color: #2196F3; margin: 0 0 10px 0;">${m.name}</h3>
        <p><strong>Quantity:</strong> ${m.quantity} &nbsp; <strong>Dosage:</strong> ${m.dosage}</p>
        <p><strong>Times:</strong> ${m.reminders?.map(r => `${r.period} (${r.time})`).join(', ')}</p>
        <p><strong>Meal Relation:</strong> ${m.mealRelation?.replace(/_/g, ' ') || 'N/A'}</p>
        ${m.notes ? `<p><strong>Notes:</strong> ${m.notes}</p>` : ''}
      </div>
    `).join('');

  const emailResult = await sendEmail({
    to:      user.email,
    subject: '💊 Your Medication Schedule is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%); color: white; padding: 20px; text-align: center;">
          <h1>Smart Medical Reminder System</h1>
          <p>Your medication reminders have been set up successfully!</p>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #333;">Hello ${user.fullName},</h2>
          <p>Your medication schedule has been configured:</p>
          ${medList}
          <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2196F3;">Reminder Settings</h3>
            <ul>
              <li>📧 Email reminders: Enabled</li>
              <li>📱 SMS reminders: ${user.phone ? 'Enabled via Text.lk' : 'Disabled (no phone number)'}</li>
              <li>📅 Calendar sync: Available</li>
            </ul>
          </div>
        </div>
      </div>
    `
  });

  for (const med of medications) {
    if (!med.reminderSettings?.emailEnabled) continue;
    for (const r of med.reminders || []) {
      scheduledReminders.push({ medication: med.name, time: r.time, email: user.email, status: 'scheduled' });
    }
  }

  res.status(200).json({
    success:            true,
    message:            'Email reminders scheduled successfully',
    scheduledReminders,
    emailSent:          emailResult.success,
    messageId:          emailResult.messageId
  });
});

// ═══════════════════════════════════════════════════════════════
// GET DUE MEDICATIONS  GET /api/medications/due/reminders
// ═══════════════════════════════════════════════════════════════
export const getDueMedications = catchAsync(async (req, res, next) => {
  const now         = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const medications = await Medication.getMedicationsDueForReminder(currentTime);

  res.status(200).json({
    success:     true,
    count:       medications.length,
    currentTime,
    data:        medications
  });
});

// ═══════════════════════════════════════════════════════════════
// UPDATE ADHERENCE  POST /api/medications/adherence
// ═══════════════════════════════════════════════════════════════
export const updateAdherence = catchAsync(async (req, res, next) => {
  const { medicationId, timePeriod, taken, notes } = req.body;

  const medication = await Medication.findOne({ _id: medicationId, userId: req.user.id });
  if (!medication) return next(new AppError('Medication not found', 404));

  const today              = new Date().toISOString().split('T')[0];
  const existingEntryIndex = medication.adherenceLog.findIndex(entry =>
    entry.date.toISOString().split('T')[0] === today && entry.timePeriod === timePeriod
  );

  if (existingEntryIndex >= 0) {
    medication.adherenceLog[existingEntryIndex].taken   = taken;
    medication.adherenceLog[existingEntryIndex].takenAt = taken ? new Date() : null;
    medication.adherenceLog[existingEntryIndex].notes   = notes || '';
  } else {
    medication.adherenceLog.push({
      date: new Date(), timePeriod, taken,
      takenAt: taken ? new Date() : null,
      notes: notes || ''
    });
  }

  await medication.save();

  res.status(200).json({ success: true, message: 'Adherence updated successfully', data: medication.adherenceLog });
});

// ═══════════════════════════════════════════════════════════════
// GET ADHERENCE STATS  GET /api/medications/adherence/stats
// ═══════════════════════════════════════════════════════════════
export const getAdherenceStats = catchAsync(async (req, res, next) => {
  const { days = 30 } = req.query;

  const medications = await Medication.find({ userId: req.user.id, isActive: true });
  const startDate   = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const stats = { totalMedications: medications.length, adherenceRate: 0, missedDoses: 0, takenDoses: 0, byMedication: [], byDay: [] };

  for (const med of medications) {
    const logs = med.adherenceLog.filter(e => e.date >= startDate);
    const taken  = logs.filter(e => e.taken).length;
    const missed = logs.length - taken;

    stats.byMedication.push({
      name: med.name,
      totalDoses: logs.length,
      takenDoses: taken,
      missedDoses: missed,
      adherenceRate: logs.length > 0 ? (taken / logs.length) * 100 : 0
    });

    stats.takenDoses  += taken;
    stats.missedDoses += missed;
  }

  stats.totalDoses   = stats.takenDoses + stats.missedDoses;
  stats.adherenceRate = stats.totalDoses > 0 ? (stats.takenDoses / stats.totalDoses) * 100 : 0;

  for (let i = 0; i < parseInt(days); i++) {
    const date    = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    let dayTaken = 0, dayMissed = 0;
    medications.forEach(med => {
      med.adherenceLog.forEach(e => {
        if (e.date.toISOString().split('T')[0] === dateStr) {
          e.taken ? dayTaken++ : dayMissed++;
        }
      });
    });

    stats.byDay.unshift({ date: dateStr, taken: dayTaken, missed: dayMissed, total: dayTaken + dayMissed });
  }

  res.status(200).json({ success: true, data: stats });
});