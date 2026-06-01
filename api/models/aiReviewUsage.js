const mongoose = require('mongoose');

const aiReviewUsageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    },
    date: {
        type: String, // store YYYY-MM-DD
        required: true,
    },
}, { timestamps: true });

aiReviewUsageSchema.index({ user: 1, question: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AIReviewUsage', aiReviewUsageSchema);