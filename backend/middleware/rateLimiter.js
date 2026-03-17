import rateLimit from 'express-rate-limit';

// ========== GENERAL API RATE LIMITER ==========
// Applies to all /api routes
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// ========== AUTHENTICATION RATE LIMITER ==========
// Stricter limits for login/register endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 authentication attempts per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ========== NOTIFICATION RATE LIMITER ==========
// Custom limits for notification endpoints to prevent spam
export const notificationLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 30, // Limit each IP to 30 notification requests per minute
    message: {
        success: false,
        message: 'Too many notification requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator - can be used to rate limit per user instead of IP
    // keyGenerator: (req) => req.user?.id || req.ip,
});

// ========== FILE UPLOAD RATE LIMITER ==========
// For endpoints that handle file uploads
export const uploadLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit to 10 uploads per minute
    message: {
        success: false,
        message: 'Too many file uploads, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ========== STRICT RATE LIMITER ==========
// For very sensitive endpoints (password reset, etc.)
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Only 3 requests per hour
    message: {
        success: false,
        message: 'Request limit exceeded. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default {
    apiLimiter,
    authLimiter,
    notificationLimiter,
    uploadLimiter,
    strictLimiter
};