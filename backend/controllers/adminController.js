import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = catchAsync(async (req, res, next) => {
  const { 
    role, 
    isActive, 
    isBlocked, 
    isEmailVerified, 
    search,
    page = 1,
    limit = 100,
    sortBy = '-createdAt'
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
  if (isEmailVerified !== undefined) filter.isEmailVerified = isEmailVerified === 'true';
  
  // Search functionality
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Get users
  const users = await User.find(filter)
    .select('-password -otpCode -otpExpires -passwordResetToken -passwordResetExpires -googleAccessToken -googleRefreshToken')
    .sort(sortBy)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await User.countDocuments(filter);

  // Calculate statistics
  const stats = {
    total: await User.countDocuments(),
    patients: await User.countDocuments({ role: 'patient' }),
    doctors: await User.countDocuments({ role: 'doctor' }),
    admins: await User.countDocuments({ role: 'admin' }),
    active: await User.countDocuments({ isActive: true }),
    verified: await User.countDocuments({ isEmailVerified: true }),
    blocked: await User.countDocuments({ isBlocked: true }),
    inactive: await User.countDocuments({ isActive: false })
  };

  res.status(200).json({
    success: true,
    results: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    stats,
    users
  });
});

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password -otpCode -otpExpires -passwordResetToken -passwordResetExpires -googleAccessToken -googleRefreshToken');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    success: true,
    user
  });
});

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = catchAsync(async (req, res, next) => {
  const {
    fullName,
    email,
    password,
    phone,
    role,
    dateOfBirth,
    address,
    emergencyContact,
    medicalLicense,
    specialization,
    workplace,
    isEmailVerified
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('A user with this email already exists', 400));
  }

  // Create user object based on role
  const userData = {
    fullName,
    email,
    password,
    phone,
    role: role || 'patient',
    isEmailVerified: isEmailVerified || false,
    isActive: true
  };

  // Add role-specific fields
  if (role === 'patient') {
    userData.dateOfBirth = dateOfBirth;
    userData.address = address;
    userData.emergencyContact = emergencyContact;
  } else if (role === 'doctor') {
    userData.medicalLicense = medicalLicense;
    userData.specialization = specialization;
    userData.workplace = workplace;
  }

  const user = await User.create(userData);

  // Remove sensitive data from response
  user.password = undefined;

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = catchAsync(async (req, res, next) => {
  // Fields that can be updated
  const allowedFields = [
    'fullName',
    'phone',
    'role',
    'dateOfBirth',
    'address',
    'emergencyContact',
    'bloodType',
    'height',
    'weight',
    'medicalLicense',
    'specialization',
    'workplace',
    'consultationFee',
    'availability',
    'isActive',
    'isBlocked',
    'isEmailVerified'
  ];

  // Filter out fields that are not allowed
  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Prevent admin from updating their own status
  if (req.user._id.toString() === req.params.id) {
    if (updates.isBlocked !== undefined || updates.isActive !== undefined) {
      return next(new AppError('You cannot modify your own account status', 400));
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true
    }
  ).select('-password -otpCode -otpExpires -passwordResetToken -passwordResetExpires');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = catchAsync(async (req, res, next) => {
  // Prevent admin from deleting themselves
  if (req.user._id.toString() === req.params.id) {
    return next(new AppError('You cannot delete your own account', 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Prevent deletion of the last admin
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return next(new AppError('Cannot delete the last admin account', 400));
    }
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: null
  });
});

// @desc    Block/Unblock user
// @route   PATCH /api/admin/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = catchAsync(async (req, res, next) => {
  const { isBlocked } = req.body;

  // Prevent admin from blocking themselves
  if (req.user._id.toString() === req.params.id) {
    return next(new AppError('You cannot block your own account', 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Prevent blocking the last admin
  if (user.role === 'admin' && isBlocked) {
    const activeAdminCount = await User.countDocuments({ 
      role: 'admin', 
      isBlocked: false 
    });
    if (activeAdminCount <= 1) {
      return next(new AppError('Cannot block the last active admin account', 400));
    }
  }

  user.isBlocked = isBlocked;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      isBlocked: user.isBlocked
    }
  });
});

// @desc    Activate/Deactivate user
// @route   PATCH /api/admin/users/:id/activate
// @access  Private/Admin
export const toggleActivateUser = catchAsync(async (req, res, next) => {
  const { isActive } = req.body;

  // Prevent admin from deactivating themselves
  if (req.user._id.toString() === req.params.id) {
    return next(new AppError('You cannot deactivate your own account', 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  user.isActive = isActive;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive
    }
  });
});

// @desc    Verify user email manually
// @route   PATCH /api/admin/users/:id/verify-email
// @access  Private/Admin
export const verifyUserEmail = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError('User email is already verified', 400));
  }

  user.isEmailVerified = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'User email verified successfully',
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      isEmailVerified: user.isEmailVerified
    }
  });
});

// @desc    Get user statistics
// @route   GET /api/admin/statistics
// @access  Private/Admin
export const getUserStatistics = catchAsync(async (req, res, next) => {
  const stats = {
    users: {
      total: await User.countDocuments(),
      patients: await User.countDocuments({ role: 'patient' }),
      doctors: await User.countDocuments({ role: 'doctor' }),
      admins: await User.countDocuments({ role: 'admin' })
    },
    status: {
      active: await User.countDocuments({ isActive: true }),
      inactive: await User.countDocuments({ isActive: false }),
      verified: await User.countDocuments({ isEmailVerified: true }),
      unverified: await User.countDocuments({ isEmailVerified: false }),
      blocked: await User.countDocuments({ isBlocked: true })
    },
    recent: {
      today: await User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      thisWeek: await User.countDocuments({
        createdAt: { $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) }
      }),
      thisMonth: await User.countDocuments({
        createdAt: { $gte: new Date(new Date().setDate(1)) }
      })
    }
  };

  // Get recent users
  const recentUsers = await User.find()
    .select('fullName email role createdAt')
    .sort('-createdAt')
    .limit(5);

  res.status(200).json({
    success: true,
    stats,
    recentUsers
  });
});

// @desc    Bulk update users
// @route   PATCH /api/admin/users/bulk-update
// @access  Private/Admin
export const bulkUpdateUsers = catchAsync(async (req, res, next) => {
  const { userIds, updates } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return next(new AppError('Please provide an array of user IDs', 400));
  }

  if (!updates || Object.keys(updates).length === 0) {
    return next(new AppError('Please provide updates', 400));
  }

  // Allowed fields for bulk update
  const allowedFields = ['isActive', 'isBlocked', 'role'];
  const filteredUpdates = {};
  
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  // Prevent admin from updating their own account in bulk
  if (userIds.includes(req.user._id.toString())) {
    return next(new AppError('Cannot perform bulk operations on your own account', 400));
  }

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { $set: filteredUpdates },
    { runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: `Successfully updated ${result.modifiedCount} users`,
    modifiedCount: result.modifiedCount
  });
});

// @desc    Bulk delete users
// @route   DELETE /api/admin/users/bulk-delete
// @access  Private/Admin
export const bulkDeleteUsers = catchAsync(async (req, res, next) => {
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return next(new AppError('Please provide an array of user IDs', 400));
  }

  // Prevent admin from deleting themselves
  if (userIds.includes(req.user._id.toString())) {
    return next(new AppError('Cannot delete your own account', 400));
  }

  // Check if any of the users to delete are admins
  const adminsToDelete = await User.countDocuments({
    _id: { $in: userIds },
    role: 'admin'
  });

  if (adminsToDelete > 0) {
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    if (totalAdmins - adminsToDelete < 1) {
      return next(new AppError('Cannot delete all admin accounts', 400));
    }
  }

  const result = await User.deleteMany({ _id: { $in: userIds } });

  res.status(200).json({
    success: true,
    message: `Successfully deleted ${result.deletedCount} users`,
    deletedCount: result.deletedCount
  });
});

// @desc    Export users data
// @route   GET /api/admin/users/export
// @access  Private/Admin
export const exportUsers = catchAsync(async (req, res, next) => {
  const { format = 'json', role } = req.query;

  const filter = {};
  if (role) filter.role = role;

  const users = await User.find(filter)
    .select('-password -otpCode -otpExpires -passwordResetToken -passwordResetExpires -googleAccessToken -googleRefreshToken')
    .sort('-createdAt');

  if (format === 'json') {
    res.status(200).json({
      success: true,
      count: users.length,
      exportDate: new Date().toISOString(),
      users
    });
  } else if (format === 'csv') {
    // Convert to CSV format
    const csvHeaders = 'ID,Full Name,Email,Phone,Role,Active,Verified,Blocked,Created At\n';
    const csvData = users.map(user => 
      `${user._id},${user.fullName},${user.email},${user.phone || ''},${user.role},${user.isActive},${user.isEmailVerified},${user.isBlocked},${user.createdAt}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
    res.status(200).send(csvHeaders + csvData);
  } else {
    return next(new AppError('Invalid format. Use json or csv', 400));
  }
});

// @desc    Reset user password (Admin)
// @route   PATCH /api/admin/users/:id/reset-password
// @access  Private/Admin
export const resetUserPassword = catchAsync(async (req, res, next) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return next(new AppError('Please provide a valid password (minimum 6 characters)', 400));
  }

  const user = await User.findById(req.params.id).select('+password');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User password reset successfully'
  });
});