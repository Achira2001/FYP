import express from 'express';
import * as profileController from '../controllers/profileController.js';
import * as authMiddleware from '../middleware/auth.js';

const router = express.Router();

// ========================================
// PROTECT ALL ROUTES
// ========================================
router.use(authMiddleware.protect);

// ========================================
// PROFILE ROUTES
// ========================================

// Get user profile
router.get('/', profileController.getProfile);

// Update user profile
router.put('/', profileController.updateProfile);

// Update password
router.patch('/update-password', profileController.updatePassword);

// ========================================
// MEDICAL HISTORY ROUTES
// ========================================

// Add medical history entry
router.post('/medical-history', profileController.addMedicalHistory);

// Update medical history entry
router.put('/medical-history/:id', profileController.updateMedicalHistory);

// Delete medical history entry
router.delete('/medical-history/:id', profileController.deleteMedicalHistory);

// ========================================
// MEDICATION ROUTES (User Model)
// ========================================
// Note: These are for medications stored in the User model
// For the new Medication model, use /api/medications routes

// Add medication
router.post('/medications', profileController.addMedication);

// Update medication
router.put('/medications/:id', profileController.updateMedication);

// Delete medication
router.delete('/medications/:id', profileController.deleteMedication);

export default router;