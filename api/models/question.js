const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description:{
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
    topic : {
        type: [String],
        required: true,
    }
},{timestamps: true});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;