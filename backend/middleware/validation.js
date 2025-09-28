import { body, param, query, validationResult } from "express-validator";
import AppError from "../utils/appError.js";

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(errorMessages[0], 400));
  }
  next();
};

// Registration validation
export const validateRegistration = [
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('role')
    .optional()
    .isIn(['patient', 'doctor', 'admin'])
    .withMessage('Invalid role specified'),

  // Patient-specific validation
  body('dateOfBirth')
    .if(body('role').equals('patient'))
    .notEmpty()
    .withMessage('Date of birth is required for patients')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 150) {
        throw new Error('Please provide a valid date of birth');
      }
      return true;
    }),

  body('address')
    .if(body('role').equals('patient'))
    .notEmpty()
    .withMessage('Address is required for patients')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),

  body('emergencyContact')
    .if(body('role').equals('patient'))
    .notEmpty()
    .withMessage('Emergency contact is required for patients')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid emergency contact number'),

  // Doctor-specific validation
  body('medicalLicense')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Medical license is required for doctors')
    .isLength({ min: 5, max: 50 })
    .withMessage('Medical license must be between 5 and 50 characters'),

  body('specialization')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Specialization is required for doctors')
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialization must be between 2 and 100 characters'),

  body('workplace')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Workplace is required for doctors')
    .isLength({ min: 2, max: 200 })
    .withMessage('Workplace must be between 2 and 200 characters'),

  // Admin-specific validation
  body('adminCode')
    .if(body('role').equals('admin'))
    .notEmpty()
    .withMessage('Admin code is required for admin registration'),

  handleValidationErrors
];

// Login validation
export const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// OTP validation
export const validateOTP = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),

  handleValidationErrors
];

// Email validation (for forgot password, resend OTP)
export const validateEmail = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  handleValidationErrors
];

// Reset code validation
export const validateResetCode = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('resetCode')
    .notEmpty()
    .withMessage('Reset code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Reset code must be exactly 6 digits')
    .isNumeric()
    .withMessage('Reset code must contain only numbers'),

  handleValidationErrors
];

// Password reset validation
export const validatePasswordReset = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('resetCode')
    .notEmpty()
    .withMessage('Reset code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Reset code must be exactly 6 digits')
    .isNumeric()
    .withMessage('Reset code must contain only numbers'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  handleValidationErrors
];

// Password update validation (for logged-in users)
export const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  handleValidationErrors
];

// Profile update validation
export const validateProfileUpdate = [
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),

  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('address')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),

  body('emergencyContact')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid emergency contact number'),

  body('specialization')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialization must be between 2 and 100 characters'),

  body('workplace')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Workplace must be between 2 and 200 characters'),

  // Meal times validation for patients
  body('mealTimes.breakfast')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Breakfast time must be in HH:MM format'),

  body('mealTimes.lunch')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Lunch time must be in HH:MM format'),

  body('mealTimes.dinner')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Dinner time must be in HH:MM format'),

  // Medical history validation
  body('medicalHistory.*.condition')
    .optional()
    .notEmpty()
    .withMessage('Medical condition is required'),

  body('medicalHistory.*.diagnosedDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid diagnosed date'),

  // Medications validation
  body('medications.*.name')
    .optional()
    .notEmpty()
    .withMessage('Medication name is required'),

  body('medications.*.dosage')
    .optional()
    .notEmpty()
    .withMessage('Medication dosage is required'),

  body('medications.*.frequency')
    .optional()
    .notEmpty()
    .withMessage('Medication frequency is required'),

  body('medications.*.startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),

  body('medications.*.endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),

  body('medications.*.beforeFood')
    .optional()
    .isBoolean()
    .withMessage('Before food must be true or false'),

  handleValidationErrors
];

// Basic update validation (for updateMe route)
export const validateBasicUpdate = [
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),

  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  // Prevent password updates through this route
  body('password')
    .not()
    .exists()
    .withMessage('Password updates are not allowed through this route'),

  body('passwordConfirm')
    .not()
    .exists()
    .withMessage('Password updates are not allowed through this route'),

  body('role')
    .not()
    .exists()
    .withMessage('Role updates are not allowed'),

  body('email')
    .not()
    .exists()
    .withMessage('Email updates are not allowed through this route'),

  handleValidationErrors
];

// Custom validation for health-specific data
export const validateHealthData = [
  body('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),

  body('height')
    .optional()
    .isNumeric()
    .withMessage('Height must be a number')
    .custom((value) => {
      if (value < 50 || value > 300) {
        throw new Error('Height must be between 50 and 300 cm');
      }
      return true;
    }),

  body('weight')
    .optional()
    .isNumeric()
    .withMessage('Weight must be a number')
    .custom((value) => {
      if (value < 20 || value > 500) {
        throw new Error('Weight must be between 20 and 500 kg');
      }
      return true;
    }),

  handleValidationErrors
];


// Validate medication creation
export const validateMedication = [
  body('drugType')
    .isIn(['oral', 'inhalers', 'patches', 'drops', 'insulin'])
    .withMessage('Drug type must be one of: oral, inhalers, patches, drops, insulin'),
  
  body('drugSubcategory')
    .notEmpty()
    .withMessage('Drug subcategory is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Drug subcategory must be between 2 and 50 characters'),
  
  body('name')
    .notEmpty()
    .withMessage('Medication name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Medication name must be between 2 and 100 characters')
    .trim(),
  
  body('dosage')
    .notEmpty()
    .withMessage('Dosage is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Dosage must be between 1 and 50 characters')
    .trim(),
  
  body('quantity')
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50'),
  
  body('timePeriods')
    .isArray({ min: 1 })
    .withMessage('At least one time period is required')
    .custom((timePeriods) => {
      const validPeriods = ['morning', 'afternoon', 'evening', 'night'];
      const isValid = timePeriods.every(period => validPeriods.includes(period));
      if (!isValid) {
        throw new Error('Invalid time period. Must be one of: morning, afternoon, evening, night');
      }
      return true;
    }),
  
  body('mealRelation')
    .isIn(['before_meals', 'after_meals', 'with_meals', 'independent_of_meals'])
    .withMessage('Meal relation must be one of: before_meals, after_meals, with_meals, independent_of_meals'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
    .trim(),
  
  body('sideEffects')
    .optional()
    .isArray()
    .withMessage('Side effects must be an array'),
  
  body('sideEffects.*')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Each side effect must not exceed 100 characters'),
  
  body('reminderSettings.googleCalendarEnabled')
    .optional()
    .isBoolean()
    .withMessage('Google Calendar setting must be boolean'),
  
  body('reminderSettings.smsEnabled')
    .optional()
    .isBoolean()
    .withMessage('SMS setting must be boolean'),
  
  body('reminderSettings.emailEnabled')
    .optional()
    .isBoolean()
    .withMessage('Email setting must be boolean'),
  
  handleValidationErrors
];

// Validate medication update
export const validateMedicationUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid medication ID'),
  
  body('drugType')
    .optional()
    .isIn(['oral', 'inhalers', 'patches', 'drops', 'insulin'])
    .withMessage('Drug type must be one of: oral, inhalers, patches, drops, insulin'),
  
  body('drugSubcategory')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Drug subcategory must be between 2 and 50 characters'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Medication name must be between 2 and 100 characters')
    .trim(),
  
  body('dosage')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Dosage must be between 1 and 50 characters')
    .trim(),
  
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50'),
  
  body('timePeriods')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one time period is required')
    .custom((timePeriods) => {
      const validPeriods = ['morning', 'afternoon', 'evening', 'night'];
      const isValid = timePeriods.every(period => validPeriods.includes(period));
      if (!isValid) {
        throw new Error('Invalid time period. Must be one of: morning, afternoon, evening, night');
      }
      return true;
    }),
  
  body('mealRelation')
    .optional()
    .isIn(['before_meals', 'after_meals', 'with_meals', 'independent_of_meals'])
    .withMessage('Meal relation must be one of: before_meals, after_meals, with_meals, independent_of_meals'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
    .trim(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be boolean'),
  
  handleValidationErrors
];

// Validate adherence tracking
export const validateAdherence = [
  body('medicationId')
    .isMongoId()
    .withMessage('Invalid medication ID'),
  
  body('timePeriod')
    .isIn(['morning', 'afternoon', 'evening', 'night'])
    .withMessage('Time period must be one of: morning, afternoon, evening, night'),
  
  body('notes')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Notes must not exceed 200 characters')
    .trim(),
  
  handleValidationErrors
];

// Validate sync requests
export const validateSyncRequest = [
  body('medicationIds')
    .optional()
    .isArray()
    .withMessage('Medication IDs must be an array'),
  
  body('medicationIds.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid medication ID in array'),
  
  handleValidationErrors
];

// Validate adherence report query
export const validateAdherenceReport = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      if (req.query.startDate && endDate) {
        const start = new Date(req.query.startDate);
        const end = new Date(endDate);
        if (end <= start) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validate meal times
export const validateMealTimes = [
  body('mealTimes.breakfast')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Breakfast time must be in HH:MM format'),
  
  body('mealTimes.lunch')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Lunch time must be in HH:MM format'),
  
  body('mealTimes.dinner')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Dinner time must be in HH:MM format'),
  
  handleValidationErrors
];
