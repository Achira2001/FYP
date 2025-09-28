import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Email from "../utils/email.js";

// Helper function to filter object properties
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;ac
};

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Create and send JWT token
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove sensitive data from output
  user.password = undefined;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP for storage
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// REGISTER
export const register = catchAsync(async (req, res, next) => {
  const {
    fullName,
    email,
    password,
    phone,
    role = 'patient',
    dateOfBirth,
    address,
    emergencyContact,
    medicalLicense,
    specialization,
    workplace,
    adminCode
  } = req.body;

  // Basic validation
  if (!fullName || !email || !password || !phone) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Role-specific validation
  if (role === 'patient' && (!dateOfBirth || !address || !emergencyContact)) {
    return next(new AppError('Please provide all required patient information', 400));
  }

  if (role === 'doctor' && (!medicalLicense || !specialization || !workplace)) {
    return next(new AppError('Please provide all required doctor information', 400));
  }

  if (role === 'admin' && (!adminCode || adminCode !== process.env.ADMIN_CODE)) {
    return next(new AppError('Invalid admin code', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user data object
  const userData = {
    fullName: fullName.trim(),
    email: email.toLowerCase(),
    password: hashedPassword,
    phone: phone.trim(),
    role
  };

  // Add role-specific data
  if (role === 'patient') {
    userData.dateOfBirth = dateOfBirth;
    userData.address = address.trim();
    userData.emergencyContact = emergencyContact.trim();
    userData.mealTimes = {
      breakfast: "08:00",
      lunch: "13:00",
      dinner: "19:00"
    };
  } else if (role === 'doctor') {
    userData.medicalLicense = medicalLicense.trim();
    userData.specialization = specialization.trim();
    userData.workplace = workplace.trim();
    userData.patients = [];
  } else if (role === 'admin') {
    userData.adminCode = adminCode;
    userData.permissions = ['manage_users', 'view_analytics', 'system_settings'];
  }

  // Generate OTP
  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  userData.otpCode = hashedOTP;
  userData.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  userData.otpAttempts = 0;

  const newUser = await User.create(userData);

  try {
    // ✅Send OTP email
    await new Email(newUser, '', otp).sendWelcomeOTP();
    console.log(`OTP email sent successfully to ${email}: ${otp}`);

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registration successful! Please check your email for verification code.`,
      data: {
        email: newUser.email,
        role: newUser.role,
        emailVerificationRequired: true
      }
    });
  } catch (err) {
    console.error('Email sending error:', err);
    
    // Don't clean up user - still allow OTP verification even if email fails
    // Just log the error and inform user
    console.log(`OTP for ${email} (email failed): ${otp}`); // Backup log

    res.status(201).json({
      success: true,
      message: `Registration successful! Email delivery may be delayed. Your verification code is: ${otp}`,
      data: {
        email: newUser.email,
        role: newUser.role,
        emailVerificationRequired: true,
        emailDeliveryIssue: true // Flag to frontend
      }
    });
  }
});

// VERIFY OTP
export const verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError('Please provide email and OTP', 400));
  }

  const user = await User.findOne({ 
    email: email.toLowerCase() 
  }).select('+otpCode +otpExpires +otpAttempts');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified', 400));
  }

  // Check if OTP is expired
  if (!user.otpExpires || Date.now() > user.otpExpires) {
    return next(new AppError('OTP has expired. Please request a new one.', 400));
  }

  // Check attempts limit
  if (user.otpAttempts >= 3) {
    return next(new AppError('Too many failed attempts. Please request a new OTP.', 429));
  }

  // Verify OTP
  const hashedOTP = hashOTP(otp);
  
  if (hashedOTP !== user.otpCode) {
    user.otpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    
    const remainingAttempts = 3 - user.otpAttempts;
    return next(new AppError(`Invalid OTP. ${remainingAttempts} attempts remaining.`, 400));
  }

  // OTP is valid - verify user
  user.isEmailVerified = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  user.otpAttempts = undefined;
  user.lastLogin = new Date();

  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res, 'Email verified successfully! Welcome to Smart Health Assistant.');
});

// RESEND OTP
export const resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide email address', 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified', 400));
  }

  // Check rate limiting (prevent spam)
  if (user.otpExpires && Date.now() < user.otpExpires - 5 * 60 * 1000) {
    return next(new AppError('Please wait before requesting a new OTP', 429));
  }

  // Generate new OTP
  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  user.otpCode = hashedOTP;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;

  await user.save({ validateBeforeSave: false });

  try {
    // Send OTP email
    await new Email(user, '', otp).sendOTPResend();
    console.log(`New OTP for ${email}: ${otp}`); // For development

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email',
      data: {
        email: user.email,
        otpSent: true
      }
    });
  } catch (err) {
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Failed to send OTP. Please try again later.', 500));
  }
});

// LOGIN
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find user and include password field
  const user = await User.findOne({ 
    email: email.toLowerCase() 
  }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Check if account is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  // Check email verification
  if (!user.isEmailVerified) {
    // Generate new OTP for unverified users
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    user.otpCode = hashedOTP;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;

    await user.save({ validateBeforeSave: false });

    try {
      // Send OTP email
      console.log(`OTP for login verification ${email}: ${otp}`); // For development
    } catch (err) {
      // Continue even if email fails
    }

    return res.status(200).json({
      success: false,
      message: 'Please verify your email first. A new verification code has been sent.',
      emailVerificationRequired: true,
      email: user.email
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res, 'Login successful');
});

// LOGOUT
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// FORGOT PASSWORD
export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() });

  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // Generate 6-digit reset code
  const resetCode = generateOTP();
  const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

  user.passwordResetToken = hashedResetCode;
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await user.save({ validateBeforeSave: false });

  try {
    // Send reset code email
    await new Email(user, '', resetCode).sendPasswordReset();
    console.log(`Password reset code for ${user.email}: ${resetCode}`); // For development

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later.', 500));
  }
});

// VERIFY RESET CODE
export const verifyResetCode = catchAsync(async (req, res, next) => {
  const { email, resetCode } = req.body;

  if (!email || !resetCode) {
    return next(new AppError('Please provide email and reset code', 400));
  }

  const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

  const user = await User.findOne({
    email: email.toLowerCase(),
    passwordResetToken: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Reset code is invalid or has expired', 400));
  }

  res.status(200).json({
    success: true,
    message: 'Reset code verified successfully'
  });
});

// RESET PASSWORD
export const resetPassword = catchAsync(async (req, res, next) => {
  const { email, resetCode, newPassword, confirmPassword } = req.body;

  if (!email || !resetCode || !newPassword || !confirmPassword) {
    return next(new AppError('Please provide all required fields', 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }

  const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

  const user = await User.findOne({
    email: email.toLowerCase(),
    passwordResetToken: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Reset code is invalid or has expired', 400));
  }

  // Hash new password
  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});

// UPDATE PASSWORD
export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  if (!currentPassword || !password || !passwordConfirm) {
    return next(new AppError('Please provide current password, new password, and password confirmation', 400));
  }

  if (password !== passwordConfirm) {
    return next(new AppError('New password and confirmation do not match', 400));
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  user.password = await bcrypt.hash(password, 12);
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res, 'Password updated successfully');
});

// GET ME
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// GET PROFILE
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user
  });
});

// UPDATE PROFILE
export const updateProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const {
    fullName,
    phone,
    address,
    emergencyContact,
    specialization,
    workplace,
    mealTimes,
    medicalHistory,
    medications
  } = req.body;

  const updateData = {};

  // Common fields
  if (fullName) updateData.fullName = fullName.trim();
  if (phone) updateData.phone = phone.trim();

  // Role-specific updates
  if (user.role === 'patient') {
    if (address) updateData.address = address.trim();
    if (emergencyContact) updateData.emergencyContact = emergencyContact.trim();
    if (mealTimes) updateData.mealTimes = mealTimes;
    if (medicalHistory) updateData.medicalHistory = medicalHistory;
    if (medications) updateData.medications = medications;
  } else if (user.role === 'doctor') {
    if (specialization) updateData.specialization = specialization.trim();
    if (workplace) updateData.workplace = workplace.trim();
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

// UPDATE ME (basic details only)
export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not for password updates. Please use /update-password.', 400)
    );
  }

  const filteredBody = filterObj(req.body, 'fullName', 'phone');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser
    },
  });
});

// DELETE ME (deactivate account)
export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(204).json({
    success: true,
    message: 'User account deactivated successfully',
    data: null,
  });
});



