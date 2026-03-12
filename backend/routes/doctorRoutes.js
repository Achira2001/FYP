import express from 'express';
import {
  updateDoctorInfo,
  getDoctorInfo,
  sendDoctorQuery,
  getDoctorQueries,
  getQueryDetails,
  replyToQuery,
  getDoctorPatients,
  getPatientDetails,
  getDoctorDashboardStats,
  getPatientQueries,
  getPatientQueryDetails,
  markQueryAsRead,
  getUnreadResponseCount
} from '../controllers/doctorController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Patient routes (protected, any authenticated user)
router.use(protect);

router.route('/doctor-info')
  .get(getDoctorInfo)
  .put(updateDoctorInfo);

router.post('/doctor-query', sendDoctorQuery);


// Patient query routes
router.get('/patient/queries', getPatientQueries);
router.get('/patient/queries/:id', getPatientQueryDetails);
router.patch('/patient/queries/:id/read', markQueryAsRead);
router.get('/patient/queries/unread/count', getUnreadResponseCount);

// Doctor-only routes
router.use(restrictTo('doctor'));

router.get('/queries', getDoctorQueries);
router.get('/queries/:id', getQueryDetails);
router.post('/queries/:id/reply', replyToQuery);
router.get('/patients', getDoctorPatients);
router.get('/patients/:patientId', getPatientDetails);
router.get('/dashboard/stats', getDoctorDashboardStats);

export default router;