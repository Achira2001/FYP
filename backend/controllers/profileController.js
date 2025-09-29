import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import bcrypt from 'bcryptjs';

// Get user profile
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

// Update user profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const {
    fullName,
    phone,
    email,
    dateOfBirth,
    address,
    emergencyContact,
    bloodType,
    height,
    weight,
    mealTimes,
    notificationPreferences
  } = req.body;

  const updateData = {};

  if (fullName) updateData.fullName = fullName.trim();
  if (phone) updateData.phone = phone.trim();
  if (email) updateData.email = email.toLowerCase();
  if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
  if (address) updateData.address = address.trim();
  if (emergencyContact) updateData.emergencyContact = emergencyContact.trim();
  if (bloodType) updateData.bloodType = bloodType;
  if (height) updateData.height = height;
  if (weight) updateData.weight = weight;
  if (mealTimes) updateData.mealTimes = mealTimes;
  if (notificationPreferences) updateData.notificationPreferences = notificationPreferences;

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

// Update password
export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError('Please provide current password, new password, and password confirmation', 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError('New password and confirmation do not match', 400));
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// Add medical history
export const addMedicalHistory = catchAsync(async (req, res, next) => {
  const { condition, diagnosedDate, notes, isActive } = req.body;

  const user = await User.findById(req.user.id);

  user.medicalHistory.push({
    condition,
    diagnosedDate: diagnosedDate || new Date(),
    notes,
    isActive: isActive !== undefined ? isActive : true
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Medical history added successfully',
    medicalHistory: user.medicalHistory
  });
});

// Add medication to profile
export const addMedication = catchAsync(async (req, res, next) => {
  const { name, dosage, frequency, startDate, endDate, beforeFood, notes, isActive } = req.body;

  const user = await User.findById(req.user.id);

  user.medications.push({
    name,
    dosage,
    frequency,
    startDate: startDate || new Date(),
    endDate,
    beforeFood: beforeFood || false,
    notes,
    isActive: isActive !== undefined ? isActive : true
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Medication added successfully',
    medications: user.medications
  });
});