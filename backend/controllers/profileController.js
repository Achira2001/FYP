import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import bcrypt from 'bcryptjs';

// ========================================
// GET PROFILE
// ========================================
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

// ========================================
// UPDATE PROFILE
// ========================================
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
    notificationPreferences,
    // Doctor fields
    medicalLicense,
    specialization,
    workplace,
    consultationFee,
    availability
  } = req.body;

  const updateData = {};

  // Basic fields (all users)
  if (fullName) updateData.fullName = fullName.trim();
  if (phone) updateData.phone = phone.trim();
  if (email) updateData.email = email.toLowerCase();

  // Patient-specific fields
  if (req.user.role === 'patient') {
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (address) updateData.address = address.trim();
    if (emergencyContact) updateData.emergencyContact = emergencyContact.trim();
    if (bloodType) updateData.bloodType = bloodType;
    if (height) updateData.height = height;
    if (weight) updateData.weight = weight;
    if (mealTimes) updateData.mealTimes = mealTimes;
    if (notificationPreferences) updateData.notificationPreferences = notificationPreferences;
  }

  // Doctor-specific fields
  if (req.user.role === 'doctor') {
    if (medicalLicense) updateData.medicalLicense = medicalLicense;
    if (specialization) updateData.specialization = specialization;
    if (workplace) updateData.workplace = workplace;
    if (consultationFee) updateData.consultationFee = consultationFee;
    if (availability) updateData.availability = availability;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

// ========================================
// UPDATE PASSWORD
// ========================================
export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current password and new password', 400));
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return next(new AppError('New password and confirmation do not match', 400));
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordCorrect) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordChangedAt = Date.now() - 1000;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// ========================================
// MEDICAL HISTORY - ADD
// ========================================
export const addMedicalHistory = catchAsync(async (req, res, next) => {
  const { condition, diagnosedDate, notes, isActive } = req.body;

  if (!condition) {
    return next(new AppError('Condition is required', 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role !== 'patient') {
    return next(new AppError('Only patients can add medical history', 403));
  }

  user.medicalHistory.push({
    condition,
    diagnosedDate: diagnosedDate || new Date(),
    notes,
    isActive: isActive !== undefined ? isActive : true
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: 'Medical history added successfully',
    medicalHistory: user.medicalHistory
  });
});

// ========================================
// MEDICAL HISTORY - UPDATE
// ========================================
export const updateMedicalHistory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { condition, diagnosedDate, notes, isActive } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const historyItem = user.medicalHistory.id(id);

  if (!historyItem) {
    return next(new AppError('Medical history item not found', 404));
  }

  if (condition) historyItem.condition = condition;
  if (diagnosedDate) historyItem.diagnosedDate = diagnosedDate;
  if (notes !== undefined) historyItem.notes = notes;
  if (isActive !== undefined) historyItem.isActive = isActive;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Medical history updated successfully',
    medicalHistory: user.medicalHistory
  });
});

// ========================================
// MEDICAL HISTORY - DELETE
// ========================================
export const deleteMedicalHistory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const historyItem = user.medicalHistory.id(id);

  if (!historyItem) {
    return next(new AppError('Medical history item not found', 404));
  }

  user.medicalHistory.pull(id);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Medical history deleted successfully',
    medicalHistory: user.medicalHistory
  });
});

// ========================================
// MEDICATION (User Model) - ADD
// ========================================
export const addMedication = catchAsync(async (req, res, next) => {
  const { name, dosage, frequency, startDate, endDate, beforeFood, notes, isActive } = req.body;

  if (!name || !dosage) {
    return next(new AppError('Name and dosage are required', 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

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

  res.status(201).json({
    success: true,
    message: 'Medication added successfully',
    medications: user.medications
  });
});

// ========================================
// MEDICATION (User Model) - UPDATE
// ========================================
export const updateMedication = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, dosage, frequency, startDate, endDate, beforeFood, notes, isActive } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const medication = user.medications.id(id);

  if (!medication) {
    return next(new AppError('Medication not found', 404));
  }

  if (name) medication.name = name;
  if (dosage) medication.dosage = dosage;
  if (frequency) medication.frequency = frequency;
  if (startDate) medication.startDate = startDate;
  if (endDate) medication.endDate = endDate;
  if (beforeFood !== undefined) medication.beforeFood = beforeFood;
  if (notes !== undefined) medication.notes = notes;
  if (isActive !== undefined) medication.isActive = isActive;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Medication updated successfully',
    medications: user.medications
  });
});

// ========================================
// MEDICATION (User Model) - DELETE
// ========================================
export const deleteMedication = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const medication = user.medications.id(id);

  if (!medication) {
    return next(new AppError('Medication not found', 404));
  }

  user.medications.pull(id);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Medication deleted successfully',
    medications: user.medications
  });
});