import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleBlockUser,
  toggleActivateUser,
  verifyUserEmail,
  getUserStatistics,
  bulkUpdateUsers,
  bulkDeleteUsers,
  exportUsers,
  resetUserPassword
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { 
  validateRegistration,
  validateProfileUpdate 
} from '../middleware/validation.js';

const router = express.Router();

// Protect all routes - only admins can access
router.use(protect);
router.use(restrictTo('admin'));

// Statistics
router.get('/statistics', getUserStatistics);

// User management routes
router.route('/users')
  .get(getAllUsers)
  .post(validateRegistration, createUser);

// Export users
router.get('/users/export', exportUsers);

// Bulk operations
router.patch('/users/bulk-update', bulkUpdateUsers);
router.delete('/users/bulk-delete', bulkDeleteUsers);

// Single user operations
router.route('/users/:id')
  .get(getUserById)
  .put(validateProfileUpdate, updateUser)
  .delete(deleteUser);

// User status management
router.patch('/users/:id/block', toggleBlockUser);
router.patch('/users/:id/activate', toggleActivateUser);
router.patch('/users/:id/verify-email', verifyUserEmail);
router.patch('/users/:id/reset-password', resetUserPassword);

export default router;