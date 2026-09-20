const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const Question = require('../models/question');
const Submission = require('../models/submission');
const TestCase = require('../models/testCase');
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const AIReviewUsage = require('../models/aiReviewUsage');

const EXECUTION_URL = process.env.EXECUTION_SERVICE_URL;

module.exports.executeCode = async (req, res) => {
    try {
        const { code, language, input, questionId } = req.body;

        if (code === undefined) {
            return res.status(400).json({
                success: false,
                message: "Code is required",
            });
        }
        if (language === undefined) {
            return res.status(400).json({
                success: false,
                message: "Language is required",
            });
        }
        console.log("Received code execution request:", { language, code, input });

        // Use the question's own time limit. It is looked up here from the id, never taken from the
        // browser, so users can't raise it. Without a (valid) questionId the service's default applies.
        let timeLimit;
        if (questionId && mongoose.isValidObjectId(questionId)) {
            const question = await Question.findById(questionId).select("timeLimit");
            timeLimit = question?.timeLimit;
        }

        const response = await axios.post(
            `${EXECUTION_URL}/code/execute`,
            {
                code,
                language,
                input,
                timeLimit
            }
        );
        console.log("Execution service response:", response.data);

        // Forward the verdict too: TLE / RE / CE come back here as a normal 200 with the error text.
        res.status(200).json({
            success: true,
            verdict: response.data.verdict,
            output: response.data.output,
            error: response.data.error,
        });
    }
    catch (error) {
        // Connection failures on Node 20+ are AggregateErrors with an empty message,
        // so fall back to the error code / first inner error to keep the cause visible.
        const detail = error.response?.data?.error
            || error.response?.data?.message
            || error.message
            || error.code
            || error.errors?.[0]?.message;
        console.error("executeCode error:", error.response?.status, detail);
        res.status(500).json({
            success: false,
            message: "Error executing code",
            verdict: error.response?.data?.verdict,
            error: detail,
        });
    }
};

// Execution-service verdict → value stored in Submission.status (see the enum in models/submission.js).
const VERDICT_TO_STATUS = {
    AC: 'Accepted',
    WA: 'Wrong Answer',
    TLE: 'Time Limit Exceeded',
    MLE: 'Memory Limit Exceeded',
    OLE: 'Output Limit Exceeded',
    RE: 'Runtime Error',
    CE: 'Compilation Error',
};

// Convert one JSON value to stdin text.
//   scalar          → as-is                          5              → "5"
//   flat array      → length, then the elements      [1,2,3]        → "3\n1 2 3"
//   array of arrays → row count, then one row/line   [[1,2],[3,4]]  → "2\n1 2\n3 4"
const valueToStdin = (v) => {
    if (!Array.isArray(v)) return String(v);
    const rows = v.some(Array.isArray)
        ? v.map(row => (Array.isArray(row) ? row.flat(Infinity).join(' ') : String(row)))
        : [v.join(' ')];
    return `${v.length}\n${rows.join('\n')}`;
};

module.exports.submitCode = async (req, res) => {
    const { code, language, questionId } = req.body;

    if (!code || !language || !questionId) {
        return res.status(400).json({ success: false, message: "Code, language, and questionId are required" });
    }

    try {
        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ success: false, message: "Question not found" });

        const testCases = await TestCase.find({ problemId: questionId });
        if (testCases.length === 0) return res.status(400).json({ success: false, message: "No test cases found" });

        // ── Convert JSON input → plain stdin for each test case ──
        const convertedTestCases = testCases.map(tc => {
            let plainInput = tc.input;

            try {
                const parsed = JSON.parse(tc.input);
                // Convert each value to stdin text (kept identical to toPlainInput in the frontend's Problems.jsx)
                plainInput = Object.values(parsed).map(valueToStdin).join('\n');
            } catch (e) {
                // not JSON, use as-is
                plainInput = tc.input;
            }

            // Convert JSON output too: [0,1] → "0 1"
            let plainOutput = tc.output;
            try {
                const parsed = JSON.parse(tc.output);
                if (Array.isArray(parsed)) {
                    plainOutput = parsed.join(' ');
                }
            } catch (e) {
                plainOutput = tc.output;
            }

            return {
                input: plainInput,
                output: plainOutput,
            };
        });

        console.log("Converted test cases:", convertedTestCases);

        const response = await axios.post(`${EXECUTION_URL}/code/submit`, {
            code,
            language,
            input: convertedTestCases,   // ← clean plain-text input/output
            timeLimit: question.timeLimit,
        });

        const newSubmission = new Submission({
            user: req.user._id,
            question: questionId,
            code,
            language,
            status: VERDICT_TO_STATUS[response.data.verdict] || 'Wrong Answer',
            error: response.data.error || null
        });
        await newSubmission.save();

        let pointsAwarded = 0;
        if (question.difficulty === 'easy') {
            pointsAwarded = 10;
        } else if (question.difficulty === 'medium') {
            pointsAwarded = 20;
        } else if (question.difficulty === 'hard') {
            pointsAwarded = 30;
        }

        // Update the logged-in user in place (req.user is already a User document, so no import or
        // new document is needed). Every submission counts; points and "solved" only on the first AC.
        req.user.totalSubmissions = (req.user.totalSubmissions || 0) + 1;

        if (response.data.verdict === 'AC') {
            // Add the question to the user's solved problems if not already present
            if (!req.user.solvedProblems.includes(questionId)) {
                req.user.correctSubmissions = (req.user.correctSubmissions || 0) + 1;
                req.user.points = (req.user.points || 0) + pointsAwarded;
                req.user.solvedProblems.push(questionId);
            }
        }
        await req.user.save();

        res.status(200).json({
            success: true,
            message: "Code submitted successfully",
            submissionResult: response.data,
        });

    } catch (error) {
        console.error("submitCode error:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Error submitting code",
            error: error.response ? error.response.data : error.message,
        });
    }
};


module.exports.reviewCode = async (req, res) => {
    console.log("Received code review request:", req.body);
    const { code, language, questionId, query } = req.body;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const alreadyUsed = await AIReviewUsage.findOne({
        user: req.user._id,
        question: questionId,
        date: today,
    });

    if (alreadyUsed) {
        return res.status(429).json({
            success: false,
            message: "AI review already used for this question today",
        });
    }

    if (!code || !language || !questionId) {
        return res.status(400).json({
            success: false,
            message: "Code, language, and questionId are required",
        });
    }

    try {
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        const prompt = `
You are an expert competitive programming mentor reviewing a student's code.

Problem: ${question.title}
Difficulty: ${question.difficulty}
Description: ${question.description}

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

${query ? `Student's question: ${query}` : 'Give a general code review.'}

Provide feedback with these sections:
## Correctness
## Time & Space Complexity
## Issues / Bugs
## Optimisation Tips
## Hints (no spoilers)

Be concise, use bullet points, keep it mentor-like.
        `.trim();

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.3,
            max_tokens: 1000,
        });
        await AIReviewUsage.create({
            user: req.user._id,
            question: questionId,
            date: today,
        });

        return res.status(200).json({
            success: true,
            review: response.choices[0].message.content,
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error getting AI review",
            error: err.message,
        });
    }
};