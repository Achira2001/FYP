import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    type: {
        type: String,
        required: true,
        enum: [
            'medication_reminder',
            'medication_scheduled',
            'doctor_response',
            'patient_query',
            'appointment',
            'system',
            'diet_recommendation',
            'message',
            'admin_alert'
        ]
    },

    title: {
        type: String,
        required: true,
        maxlength: 100
    },

    message: {
        type: String,
        required: true,
        maxlength: 500
    },

    icon: {
        type: String,
        default: '\u{1F514}'
    },

    // Reference to related documents
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedModel'
    },

    relatedModel: {
        type: String,
        enum: ['Medication', 'Query', 'User', 'DietPlan']
    },

    // Notification status
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },

    readAt: {
        type: Date
    },

    // Priority
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

    // Action link
    actionUrl: {
        type: String
    },

    // Metadata for additional info
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },

    // Expiry
    expiresAt: {
        type: Date,
        index: true
    }

}, {
    timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create notification
notificationSchema.statics.createNotification = async function (data) {
    return await this.create(data);
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function (notificationId, userId) {
    return await this.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true, readAt: new Date() },
        { new: true }
    );
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function (userId) {
    return await this.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
    );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
    return await this.countDocuments({ userId, isRead: false });
};

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;