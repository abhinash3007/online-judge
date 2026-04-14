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
    constraints: {
        type: [String],
        required: true,
    },
    topic: {
        type: [String],
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
}, { timestamps: true });

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;