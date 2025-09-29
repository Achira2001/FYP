import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// Verify Google token and login/register user
export const googleLogin = catchAsync(async (req, res, next) => {
  const { tokenId } = req.body;

  if (!tokenId) {
    return next(new AppError('Google token is required', 400));
  }

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, sub } = payload;

    // Check if user already exists by email or Google ID
    let user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { googleId: sub }
      ]
    });

    if (user) {
      // Check if account is active
      if (!user.isActive) {
        return next(new AppError('Your account has been deactivated. Please contact support.', 401));
      }

      // If user exists but doesn't have googleId, add it
      if (!user.googleId) {
        user.googleId = sub;
        await user.save({ validateBeforeSave: false });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      return createSendToken(user, 200, res, 'Login successful with Google');
    }

    // User doesn't exist, create new patient account
    const fullName = `${given_name} ${family_name}`;
    
    // Generate a random password for Google users
    const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);

    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: randomPassword, // Will be hashed by pre-save hook
      role: 'patient', // Only allow patient registration via Google
      isEmailVerified: true, // Google email is already verified
      googleId: sub,
      avatar: picture
    });

    // Update last login
    newUser.lastLogin = new Date();
    await newUser.save({ validateBeforeSave: false });

    createSendToken(newUser, 200, res, 'Account created and logged in with Google');
  } catch (error) {
    console.error('Google login error:', error);
    return next(new AppError('Google authentication failed. Please try again.', 401));
  }
});

export default {
  googleLogin
};