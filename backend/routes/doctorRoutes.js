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

// All routes require authentication
router.use(protect);


// PATIENT ROUTES  (any authenticated user — patient or doctor)

// Doctor info management (patient stores their doctor's contact)
router.route('/doctor-info')
  .get(getDoctorInfo)
  .put(updateDoctorInfo);

// Send a query to the patient's doctor
router.post('/doctor-query', sendDoctorQuery);

// Patient views their own queries and doctor responses
router.get('/patient/queries',               getPatientQueries);
router.get('/patient/queries/unread/count',  getUnreadResponseCount);
router.get('/patient/queries/:id',           getPatientQueryDetails);
router.patch('/patient/queries/:id/read',    markQueryAsRead);


// DOCTOR-ONLY ROUTES  (role: 'doctor' required)
router.use(restrictTo('doctor'));

// Doctor views and responds to patient queries
router.get('/queries',               getDoctorQueries);
router.get('/queries/:id',           getQueryDetails);
router.post('/queries/:id/reply',    replyToQuery);

// Doctor views their patient list
router.get('/patients',              getDoctorPatients);
router.get('/patients/:patientId',   getPatientDetails);

// Doctor dashboard statistics
router.get('/dashboard/stats',       getDoctorDashboardStats);

export default router;