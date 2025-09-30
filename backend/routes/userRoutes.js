import express from 'express';
import { protect } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errorMessages
    });
  }
  next();
};

router.use(protect);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Update meal times
router.put('/profile/meal-times', [
  body('breakfast').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('lunch').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('dinner').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
], validate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        'mealTimes.breakfast': req.body.breakfast,
        'mealTimes.lunch': req.body.lunch,
        'mealTimes.dinner': req.body.dinner
      },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Meal times updated successfully',
      data: user.mealTimes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update meal times',
      error: error.message
    });
  }
});

export default router;