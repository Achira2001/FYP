import DietPlan from '../models/DietPlan.js';
import { createInAppNotification } from '../utils/notificationHelper.js';

// @route   POST /api/diet-plans
// @desc    Save a new diet plan to MongoDB
export const createDietPlan = async (req, res) => {
  try {
    console.log('Received diet plan data:', {
      name: req.body.userInfo?.name,
      calories: req.body.recommendations?.daily_calories,
      generatedFrom: req.body.generatedFrom
    });

    const dietPlanData = {
      ...req.body,
      userId: req.user.id
    };

    const dietPlan = new DietPlan(dietPlanData);
    await dietPlan.save();

    console.log('Diet plan saved successfully! ID:', dietPlan._id);

    await createInAppNotification({
      userId: req.user.id,
      type: 'diet_recommendation',
      title: 'Diet Plan Generated',
      message: `${dietPlan.recommendations?.meal_plan_type || 'Your personalized'} diet plan is ready`,
      icon: '\u{1F957}',
      relatedId: dietPlan._id,
      relatedModel: 'DietPlan',
      priority: 'medium',
      actionUrl: '/patient/diet-plan',
      metadata: {
        mealPlanType: dietPlan.recommendations?.meal_plan_type,
        generatedFrom: dietPlan.generatedFrom
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    res.status(201).json({
      success: true,
      message: 'Diet plan saved successfully',
      data: dietPlan
    });
  } catch (error) {
    console.error('Error saving diet plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save diet plan',
      error: error.message
    });
  }
};

// @route   GET /api/diet-plans
// @desc    Get all diet plans
export const getDietPlans = async (req, res) => {
  try {
    const { userId, limit = 10, page = 1 } = req.query;

    console.log('Fetching diet plans...');

    const query = {
      status: 'active',
      userId: req.user.id
    };

    if (userId && userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these diet plans'
      });
    }

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);

    const dietPlans = await DietPlan.find(query)
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .skip((parsedPage - 1) * parsedLimit);

    const total = await DietPlan.countDocuments(query);

    console.log(`Found ${dietPlans.length} diet plans (total: ${total})`);

    res.json({
      success: true,
      count: dietPlans.length,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      data: dietPlans
    });
  } catch (error) {
    console.error('Error fetching diet plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diet plans',
      error: error.message
    });
  }
};

// @route   GET /api/diet-plans/recent
// @desc    Get recent diet plans (last 5)
export const getRecentDietPlans = async (req, res) => {
  try {
    const { userId } = req.query;

    console.log('Fetching recent diet plans...');

    const query = {
      status: 'active',
      userId: req.user.id
    };

    if (userId && userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these diet plans'
      });
    }

    const recentPlans = await DietPlan.find(query)
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`Found ${recentPlans.length} recent diet plans`);

    res.json({
      success: true,
      count: recentPlans.length,
      data: recentPlans
    });
  } catch (error) {
    console.error('Error fetching recent diet plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent diet plans',
      error: error.message
    });
  }
};

// @route   GET /api/diet-plans/:id
// @desc    Get single diet plan by ID
export const getDietPlanById = async (req, res) => {
  try {
    console.log('Fetching diet plan ID:', req.params.id);

    const dietPlan = await DietPlan.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!dietPlan) {
      console.log('Diet plan not found');
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }

    console.log('Diet plan found');

    res.json({
      success: true,
      data: dietPlan
    });
  } catch (error) {
    console.error('Error fetching diet plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diet plan',
      error: error.message
    });
  }
};

// @route   DELETE /api/diet-plans/:id
// @desc    Archive a diet plan (soft delete)
export const deleteDietPlan = async (req, res) => {
  try {
    console.log('Archiving diet plan ID:', req.params.id);

    const dietPlan = await DietPlan.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!dietPlan) {
      console.log('Diet plan not found');
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }

    dietPlan.status = 'archived';
    await dietPlan.save();

    console.log('Diet plan archived successfully');

    res.json({
      success: true,
      message: 'Diet plan archived successfully'
    });
  } catch (error) {
    console.error('Error deleting diet plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete diet plan',
      error: error.message
    });
  }
};

// @route   GET /api/diet-plans/stats/summary
// @desc    Get diet plan statistics
export const getDietPlanStats = async (req, res) => {
  try {
    console.log('Fetching diet plan statistics...');

    const { userId } = req.query;

    const query = {
      status: 'active',
      userId: req.user.id
    };

    if (userId && userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these diet plans'
      });
    }

    const totalPlans = await DietPlan.countDocuments(query);

    const mealPlanDistribution = await DietPlan.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$recommendations.meal_plan_type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const avgStats = await DietPlan.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgCalories: { $avg: '$recommendations.daily_calories' },
          avgProtein: { $avg: '$recommendations.protein_grams' },
          avgCarbs: { $avg: '$recommendations.carbs_grams' },
          avgFats: { $avg: '$recommendations.fats_grams' }
        }
      }
    ]);

    console.log(`Statistics: ${totalPlans} total plans`);

    res.json({
      success: true,
      data: {
        totalPlans,
        mealPlanDistribution,
        averages: avgStats[0] || {}
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};