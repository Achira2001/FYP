import express from 'express';
import rateLimit from 'express-rate-limit';

import * as authController from '../controllers/authController.js';
import * as authMiddleware from '../middleware/auth.js';
import * as validationMiddleware from '../middleware/validation.js';

const router = express.Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later.'
  }
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.'
  }
});

// PUBLIC ROUTES
router.post('/register', validationMiddleware.validateRegistration, authController.register);
router.post('/login', authLimiter, validationMiddleware.validateLogin, authController.login);
router.post('/verify-otp', otpLimiter, validationMiddleware.validateOTP, authController.verifyOTP);
router.post('/resend-otp', otpLimiter, validationMiddleware.validateEmail, authController.resendOTP);
router.post('/forgot-password', passwordResetLimiter, validationMiddleware.validateEmail, authController.forgotPassword);
router.post('/verify-reset-code', validationMiddleware.validateResetCode, authController.verifyResetCode);
router.post('/reset-password', validationMiddleware.validatePasswordReset, authController.resetPassword);

// PROTECTED ROUTES
router.use(authMiddleware.protect);

router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.get('/profile', authController.getProfile);
router.put('/profile', validationMiddleware.validateProfileUpdate, authController.updateProfile);
router.patch('/update-me', validationMiddleware.validateBasicUpdate, authController.updateMe);
router.patch('/update-password', validationMiddleware.validatePasswordUpdate, authController.updatePassword);
router.delete('/delete-me', authController.deleteMe);

export default router;
