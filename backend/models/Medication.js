import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Drug Classification
  drugType: {
    type: String,
    required: true,
    enum: ['oral', 'inhalers', 'patches', 'drops', 'insulin']
  },
  
  drugSubcategory: {
    type: String,
    required: true
  },
  
  // Basic Medicine Info
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  dosage: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 50,
    default: 1
  },

  // Number of days to send reminders
reminderDays: {
  type: Number,
  default: 7,
  min: 1,
  max: 365
},
  
  // Timing
  timePeriods: [{
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
    required: true
  }],
  
  // Calculated reminder times - THIS IS THE KEY ADDITION
  reminders: [{
    period: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      required: true
    },
    time: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    }
  }],
  
  // Meal Relation
  mealRelation: {
    type: String,
    required: true,
    enum: ['before_meals', 'after_meals', 'with_meals', 'independent_of_meals'],
    default: 'before_meals'
  },
  
  // Additional Info
  notes: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Reminder Settings
  reminderSettings: {
    calendarEnabled: {
      type: Boolean,
      default: true
    },
    smsEnabled: {
      type: Boolean,
      default: true
    },
    emailEnabled: {
      type: Boolean,
      default: true
    },
    phoneCallEnabled: {
      type: Boolean,
      default: false
    }
  },
  
  // Frequency
  frequency: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'as_needed'],
      default: 'daily'
    },
    interval: {
      type: Number,
      default: 1,
      min: 1
    },
    duration: {
      type: Number,
      default: 30,
      min: 1
    }
  },
  
  // Meal Times Reference (copied from user when medication is created)
  mealTimesSnapshot: {
    breakfast: {
      type: String,
      default: "08:00"
    },
    lunch: {
      type: String, 
      default: "13:00"
    },
    dinner: {
      type: String,
      default: "19:00"
    },
    night: {
      type: String,
      default: "22:00"
    }
  },
  
  // Tracking
  startDate: {
    type: Date,
    default: Date.now
  },
  
  endDate: {
    type: Date
  },
  
  // Last reminder sent (to avoid duplicates)
  lastReminderSent: {
    type: Date
  },
  
  // Adherence tracking
  adherenceLog: [{
    date: {
      type: Date,
      required: true
    },
    timePeriod: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      required: true
    },
    taken: {
      type: Boolean,
      required: true
    },
    takenAt: Date,
    notes: String
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
medicationSchema.index({ userId: 1, isActive: 1 });
medicationSchema.index({ userId: 1, drugType: 1 });
medicationSchema.index({ 'reminders.time': 1, isActive: 1 }); // CRITICAL INDEX
medicationSchema.index({ createdAt: -1 });
medicationSchema.index({ lastReminderSent: 1 });

// Static method to get medications due for reminder - CORRECTED VERSION
medicationSchema.statics.getMedicationsDueForReminder = function(currentTime) {
  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
  
  return this.find({
    isActive: true,
    'reminders.time': currentTime, // Match exact time
    $or: [
      { lastReminderSent: { $exists: false } },
      { lastReminderSent: { $lt: thirtyMinutesAgo } } // Not sent in last 30 minutes
    ]
  }).populate('userId', 'fullName email phone notificationPreferences');
};

const Medication = mongoose.model('Medication', medicationSchema);
export default Medication;