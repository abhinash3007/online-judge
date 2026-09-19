const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type : String,
        required : true,
    },
    email: {
        type : String,
        required : true,
        unique : true
    },
    password: {
        type : String,
        required : true
    },
    photoUrl: {
        type : String,
    },
    points: {
        type : Number,
        default : 0
    },
    role: {
        type : String,
        enum : ['user', 'admin'],
        default : 'user'
    },
    totalSubmissions: {
        type : Number,
        default : 0
    },
    correctSubmissions: {
        type : Number,
        default : 0
    },
    solvedProblems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }]

})
const User = mongoose.model("User", userSchema);

module.exports = User;