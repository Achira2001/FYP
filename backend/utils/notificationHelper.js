import Notification from '../models/Notification.js';

export const createInAppNotification = async (payload) => {
  try {
    return await Notification.create(payload);
  } catch (error) {
    console.error('Failed to create in-app notification:', error.message);
    return null;
  }
};

export const createNotificationIfNotExists = async ({ dedupeMinutes = 5, ...payload }) => {
  try {
    const since = new Date(Date.now() - dedupeMinutes * 60 * 1000);
    const existing = await Notification.findOne({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      relatedId: payload.relatedId || null,
      createdAt: { $gte: since }
    });

    if (existing) return existing;
    return await Notification.create(payload);
  } catch (error) {
    console.error('Failed to create deduplicated notification:', error.message);
    return null;
  }
};
