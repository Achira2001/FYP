import express from 'express';
import {
  getMedications,
  getMedication,
  createMedication,
  updateMedication,
  deleteMedication,
  syncGoogleCalendar,
  scheduleSMS,
  scheduleEmailReminders,
  getDueMedications,
  updateAdherence,
  getAdherenceStats
} from '../controllers/medicationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getMedications)
  .post(createMedication);

router.route('/:id')
  .get(getMedication)
  .put(updateMedication)
  .delete(deleteMedication);

router.post('/sync/google-calendar', syncGoogleCalendar);
router.post('/schedule/sms', scheduleSMS);
router.post('/schedule/email', scheduleEmailReminders);
router.get('/due/reminders', getDueMedications);
router.post('/adherence', updateAdherence);
router.get('/adherence/stats', getAdherenceStats);

export default router;