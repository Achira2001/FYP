import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createDietPlan,
  getDietPlans,
  getRecentDietPlans,
  getDietPlanById,
  deleteDietPlan,
  getDietPlanStats
} from '../controllers/dietPlanController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createDietPlan)
  .get(getDietPlans);

router.get('/recent', getRecentDietPlans);
router.get('/stats/summary', getDietPlanStats);

router.route('/:id')
  .get(getDietPlanById)
  .delete(deleteDietPlan);

export default router;