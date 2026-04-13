const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true
    },
    output:{
        type: String,
        required: true,
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
    },
    isHidden: {
        type: Boolean,
        default: false,
        required: true
    }
},{ timestamps: true });

const TestCase =  mongoose.model("TestCase", testCaseSchema);
module.exports = TestCase;