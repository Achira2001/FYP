import Notification from '../models/Notification.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

const getPopulateOptions = () => ({
  path: 'relatedId',
  options: { strictPopulate: false }
});

// GET ALL NOTIFICATIONS 
export const getNotifications = catchAsync(async (req, res, next) => {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { isRead, type } = req.query;

    const filter = { userId: req.user.id };

    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (type)                 filter.type   = type;

    // Only populate docs that actually have a relatedModel set
    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate(getPopulateOptions())
        .lean();   // plain JS objects — faster, safe for JSON


        const populated = await Promise.all(
        notifications.map(async (n) => {
            if (!n.relatedModel || !n.relatedId) return n;
            try {
                const doc = await mongoose.model(n.relatedModel).findById(n.relatedId).lean();
                return { ...n, relatedId: doc };
            } catch {
                return n;
            }
        })
    );
        
    const total = await Notification.countDocuments(filter);

    res.status(200).json({
        success: true,
        data: notifications,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        }
    });
});

//  GET SINGLE NOTIFICATION 
export const getNotification = catchAsync(async (req, res, next) => {
    const notification = await Notification.findOne({
        _id:    req.params.id,
        userId: req.user.id          // scope to the logged-in user
    })
        .populate(safePopulateOptions)
        .lean();

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    res.status(200).json({
        success: true,
        data: notification
    });
});

//  GET UNREAD COUNT 
export const getUnreadCount = catchAsync(async (req, res, next) => {
    const count = await Notification.getUnreadCount(req.user.id);

    res.status(200).json({
        success: true,
        count
    });
});

//  MARK SINGLE NOTIFICATION AS READ 
export const markAsRead = catchAsync(async (req, res, next) => {
    const notification = await Notification.markAsRead(req.params.id, req.user.id);

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification
    });
});

//  MARK ALL AS READ
export const markAllAsRead = catchAsync(async (req, res, next) => {
    await Notification.markAllAsRead(req.user.id);

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
    });
});

// DELETE SINGLE NOTIFICATION
export const deleteNotification = catchAsync(async (req, res, next) => {
    const notification = await Notification.findOneAndDelete({
        _id:    req.params.id,
        userId: req.user.id
    });

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Notification deleted'
    });
});

//  DELETE ALL READ NOTIFICATIONS 
export const deleteAllRead = catchAsync(async (req, res, next) => {
    await Notification.deleteMany({
        userId: req.user.id,
        isRead: true
    });

    res.status(200).json({
        success: true,
        message: 'All read notifications deleted'
    });
});

//  INTERNAL HELPER (used by other controllers) 
export const createNotification = async (data) => {
    try {
        return await Notification.createNotification(data);
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};