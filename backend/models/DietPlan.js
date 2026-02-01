import mongoose from 'mongoose';

const dietPlanSchema = new mongoose.Schema({
  // User reference (optional - for guest users)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },

  // User Information
  userInfo: {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    bmi: {
      type: Number,
      required: true,
    },
    goal: {
      type: String,
      required: true,
    },
  },

  // Input Data
  inputData: {
    height: Number,
    weight: Number,
    diseases: [String],
    allergies: String,
    dietPreference: String,
    activityLevel: String,
    mealsPerDay: Number,
  },

  // AI Recommendations
  recommendations: {
    daily_calories: {
      type: Number,
      required: true,
    },
    protein_grams: {
      type: Number,
      required: true,
    },
    carbs_grams: {
      type: Number,
      required: true,
    },
    fats_grams: {
      type: Number,
      required: true,
    },
    meal_plan_type: {
      type: String,
      required: true,
    },
  },

  // Macronutrient Percentages
  macro_percentages: {
    protein: Number,
    carbs: Number,
    fats: Number,
  },

  // Meal Breakdown
  meal_breakdown: [{
    name: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
  }],

  // Health Insights
  health_insights: [String],

  // Generation Method
  generatedFrom: {
    type: String,
    enum: ['manual_form', 'medical_report'],
    default: 'manual_form',
  },

  // Report Information (if uploaded)
  reportInfo: {
    uploaded: {
      type: Boolean,
      default: false,
    },
    extractedData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
dietPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
dietPlanSchema.index({ userId: 1, createdAt: -1 });
dietPlanSchema.index({ status: 1 });

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);

export default DietPlan;