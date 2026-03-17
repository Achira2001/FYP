import express from 'express';
import {
    getNotifications,
    getNotification,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication (works for patient / doctor / admin)
router.use(protect);

// Collection routes
router.get('/',                  getNotifications);
router.get('/unread/count',      getUnreadCount);
router.patch('/mark-all-read',   markAllAsRead);

// IMPORTANT: specific named routes MUST come before /:id wildcard routes
router.delete('/read', deleteAllRead);   // DELETE /api/notifications/read

// Single-item routes
router.get('/:id',               getNotification);      // full detail
router.patch('/:id/read',        markAsRead);
router.delete('/:id',            deleteNotification);

export default router;