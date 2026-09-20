const express = require('express');
const Submission = require("../models/submission");
const Question = require("../models/question");

module.exports.getUserSubmissions = async (req, res) => {
    try {

        console.log("Request received for user submissions:", req.user._id); 
        const submissions = await Submission.find({ user: req.user._id })
            .populate("question", "title slug")
            .sort({ createdAt: -1 });

            console.log("Submissions fetched:", submissions);
        res.json({ success: true, submissions });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching submissions",
            error: error.message,
        });
    }
}

module.exports.getQuestionSubmissions = async (req, res) => {
    try {
        const { questionId } = req.params;

        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        const submissions = await Submission.find({ question: questionId })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, submissions });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching submissions",
            error: error.message,
        });
    }
}

module.exports.getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('question', 'title')
            .populate('name', 'name');

        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        res.status(200).json({ success: true, submission });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
