import express from 'express';
import { updateDoctorInfo, getDoctorInfo, sendDoctorQuery } from '../controllers/doctorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/doctor-info')
  .get(getDoctorInfo)
  .put(updateDoctorInfo);

router.post('/doctor-query', sendDoctorQuery);

export default router;