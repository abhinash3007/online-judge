const express = require('express');
const TestCase = require("../models/testCase");
const Question = require("../models/question");

module.exports.createTestCase = async (req, res) => {
    try {
        const { testCases } = req.body;
        const { problemId } = req.params;

        const question = await Question.findById(problemId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        if (question.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!Array.isArray(testCases) || testCases.length === 0) {
            return res.status(400).json({
                success: false,
                message: "testCases must be a non-empty array",
            });
        }

        const invalidCases = [];

        testCases.forEach((tc, index) => {
            if (!tc.input || !tc.output) {
                invalidCases.push({
                    index,
                    message: "Input and output are required"
                });
            }
        });

        if (invalidCases.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Some test cases are invalid",
                errors: invalidCases
            });
        }

        const formatted = testCases.map(tc => ({
            input: tc.input,
            output: tc.output,
            problemId,
            isHidden: tc.isHidden ?? false
        }));

        const savedTestCases = await TestCase.insertMany(formatted);

        res.json({ success: true, testCases: savedTestCases, count: savedTestCases.length });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating test case",
            error: error.message,
        });
    }
}

module.exports.getTestCases = async (req, res) => {
    try {
        const { problemId } = req.params;
        let {page = 1, limit = 10} = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;
        const question = await Question.findById(problemId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        if (question.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const testCases = await TestCase.find({ problemId }).skip(skip).limit(limit);

        if (!testCases || testCases.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No test cases found for this problem"
            });
        }

        res.json({ success: true, testCases, page, limit });
    }

    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching test cases",
            error: error.message,
        });
    }
}

module.exports.deleteTestCase = async (req, res) => {
    try {
        const { testCaseId } = req.params;

        const testCase = await TestCase.findById(testCaseId);

        if (!testCase) {
            return res.status(404).json({
                success: false,
                message: "Test case not found",
            });
        }

        const question = await Question.findById(testCase.problemId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }
        
        if (question.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        }   
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting test case",
            error: error.message,
        });
    }
}