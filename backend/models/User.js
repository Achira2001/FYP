import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  // Basic Info
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'] 
  },
  password: { type: String, required: true, minlength: 6, select: false },
  phone: { 
    type: String, 
    match: [/^[\+]?[1-9][\d]{0,15}$/], 
    required: function() { return !this.googleId; } 
  },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },


  // Doctor Information
doctorInfo: {
  name: { type: String, trim: true, maxlength: 100 },
  hospital: { type: String, trim: true, maxlength: 200 },
  email: { 
    type: String, 
    lowercase: true, 
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'] 
  },
  phone: { 
    type: String, 
    match: [/^[\+]?[1-9][\d]{0,15}$/] 
  }
},

  // Patient fields
  dateOfBirth: { type: Date, required: function() { return this.role === 'patient' && !this.googleId; } },
  address: { type: String, minlength: 10, maxlength: 500, required: function() { return this.role === 'patient' && !this.googleId; } },
  emergencyContact: { 
    type: String, 
    match: [/^[\+]?[1-9][\d]{0,15}$/], 
    required: function() { return this.role === 'patient' && !this.googleId; } 
  },
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  height: { type: Number, min: 50, max: 300 },
  weight: { type: Number, min: 20, max: 500 },
  medicalHistory: [{ 
    condition: String, 
    diagnosedDate: Date, 
    notes: String, 
    isActive: { type: Boolean, default: true } 
  }],
  medications: [{ 
    name: String, 
    dosage: String, 
    frequency: String, 
    startDate: Date, 
    endDate: Date, 
    beforeFood: Boolean, 
    notes: String, 
    isActive: { type: Boolean, default: true } 
  }],
  mealTimes: { 
    breakfast: { 
      type: String, 
      default: "08:00", 
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'] 
    }, 
    lunch: { 
      type: String, 
      default: "13:00", 
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'] 
    }, 
    dinner: { 
      type: String, 
      default: "19:00", 
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'] 
    },
    night: {
      type: String,
      default: "22:00",
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    }
  },

  // Google OAuth fields
  googleId: { type: String, select: false },
  googleAccessToken: { type: String, select: false },
  googleRefreshToken: { type: String, select: false },
  avatar: { type: String },

  // Notification preferences
notificationPreferences: {
  email: { type: Boolean, default: true },
  sms: { type: Boolean, default: true },
  push: { type: Boolean, default: true },
  calendar: { type: Boolean, default: true }
},

  // Auth fields
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },

  // OTP & Reset
  otpCode: { type: String, select: false },
  otpExpires: { type: Date, select: false },
  otpAttempts: { type: Number, default: 0, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  passwordChangedAt: { type: Date, select: false },

  lastLogin: Date,

}, { timestamps: true });

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ createdAt: -1 });

// Virtuals
userSchema.virtual('age').get(function() {
  return this.dateOfBirth ? Math.floor((Date.now() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000)) : null;
});

userSchema.virtual('bmi').get(function() {
  return (this.height && this.weight) ? Math.round(this.weight / ((this.height / 100) ** 2) * 10) / 10 : null;
});

// Pre-save hooks
userSchema.pre('save', function(next) {
  if (!this.isNew && this.isModified('password')) this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Methods
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpCode = crypto.createHash('sha256').update(otp).digest('hex');
  this.otpExpires = Date.now() + 10 * 60 * 1000;
  this.otpAttempts = 0;
  return otp;
};

userSchema.methods.verifyOTP = function(candidateOTP) {
  const hashed = crypto.createHash('sha256').update(candidateOTP).digest('hex');
  return hashed === this.otpCode;
};

const User = mongoose.model('User', userSchema);
export default User;