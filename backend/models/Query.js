import mongoose from 'mongoose';

const querySchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },

    doctorEmail: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },

    question: {
        type: String,
        required: true,
        maxlength: 2000
    },

    response: {
        type: String,
        maxlength: 2000
    },

    status: {
        type: String,
        enum: ['pending', 'responded', 'closed'],
        default: 'pending',
        index: true
    },

    patientInfo: {
        name: String,
        email: String,
        phone: String,
        age: Number,
        medicalHistory: [String]
    },

    respondedAt: {
        type: Date
    },

    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

    isReadByDoctor: {
        type: Boolean,
        default: false
    },

    isReadByPatient: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

querySchema.index({ createdAt: -1 });
querySchema.index({ doctorId: 1, status: 1 });
querySchema.index({ patientId: 1, createdAt: -1 });

const Query = mongoose.model('Query', querySchema);
export default Query;