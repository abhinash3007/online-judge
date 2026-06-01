const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
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
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        enum: ['cpp', 'java', 'python', 'javascript'],
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded', 'Compilation Error'],
        default: 'Pending',
    },
    error: {
        type: String,
    }
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
