const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
        enum: ["easy", "medium", "hard"],
    },
    inputFormat: {
        type: String,
        required: true,
    },
    outputFormat: {
        type: String,
        required: true,
    },
    constraints: {
        type: [String],
        required: true,
    },
    topic: {
        type: [String],
        required: true,
    },
    // Per-run time limit in seconds (before the per-language allowance the execution service adds).
    // Questions created before this field existed read back as the default.
    timeLimit: {
        type: Number,
        default: 2,
        min: 0.5,
        max: 10,
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
}, { timestamps: true });

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;