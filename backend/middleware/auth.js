import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Protect routes - verify JWT token
export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  
  // Skip authentication for Google login
  if (req.originalUrl.startsWith('/api/auth/google-login')) {
    return next();
  }
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification of token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401));
    } else if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    } else {
      return next(new AppError('Token verification failed. Please log in again!', 401));
    }
  }

  // 3) Check if user still exists - FIXED: explicitly select isActive field
  const currentUser = await User.findById(decoded.id).select('+isActive');
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  // 5) Check if user's email is verified (except for certain routes)
  const exemptRoutes = ['/api/auth/logout', '/api/auth/verify-otp', '/api/auth/resend-otp'];
  if (!currentUser.isEmailVerified && !exemptRoutes.includes(req.originalUrl)) {
    return next(new AppError('Please verify your email address first.', 401));
  }

  // 6) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  // Grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Restrict to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Check if user is logged in (for rendered pages, doesn't throw error)
export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user is active
      if (!currentUser.isActive) {
        return next();
      }

      // 4) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// Role-specific middleware for health app
export const requirePatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return next(new AppError('This action is only available for patients', 403));
  }
  next();
};

export const requireDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return next(new AppError('This action is only available for doctors', 403));
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('This action is only available for administrators', 403));
  }
  next();
};

// Allow only specific roles
export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(`Access denied. This action is only available for: ${allowedRoles.join(', ')}`, 403));
    }
    next();
  };
};

// Check if doctor can access patient data
export const canAccessPatient = catchAsync(async (req, res, next) => {
  const patientId = req.params.patientId || req.body.patientId;
  
  if (!patientId) {
    return next(new AppError('Patient ID is required', 400));
  }

  // Admin can access all patients
  if (req.user.role === 'admin') {
    return next();
  }

  // Patients can only access their own data
  if (req.user.role === 'patient') {
    if (req.user._id.toString() !== patientId.toString()) {
      return next(new AppError('You can only access your own medical records', 403));
    }
    return next();
  }

  // Doctors can access their assigned patients
  if (req.user.role === 'doctor') {
    const doctor = await User.findById(req.user._id);
    if (doctor.patients && doctor.patients.includes(patientId)) {
      return next();
    }
    return next(new AppError('You do not have access to this patient\'s records', 403));
  }

  return next(new AppError('Access denied', 403));
});

// Middleware to attach user data to request for easy access
export const attachUserData = (req, res, next) => {
  if (req.user) {
    req.userData = {
      id: req.user._id,
      role: req.user.role,
      email: req.user.email,
      fullName: req.user.fullName,
      isPatient: req.user.role === 'patient',
      isDoctor: req.user.role === 'doctor',
      isAdmin: req.user.role === 'admin'
    };
  }
  next();
};