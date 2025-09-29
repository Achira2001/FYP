import express from 'express';
import * as profileController from '../controllers/profileController.js';
import * as authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.patch('/update-password', profileController.updatePassword);
router.post('/medical-history', profileController.addMedicalHistory);
router.post('/medications', profileController.addMedication);

export default router;