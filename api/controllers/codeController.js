const express = require('express');
const axios = require('axios');
const Question = require('../models/question');
const Submission = require('../models/submission');
const TestCase = require('../models/testCase');
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const AIReviewUsage = require('../models/aiReviewUsage');

module.exports.executeCode = async (req, res) => {
    try {
        const { code, language, input } = req.body;

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
        const response = await axios.post(
            "http://localhost:8080/code/execute",
            {
                code,
                language,
                input
            }
        );
        console.log("Execution service response:", response.data);

        res.status(200).json({
            success: true,
            output: response.data.output,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error executing code",
            error: error.message,
        });
    }
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
                // Convert each value: arrays → space-separated, primitives → string
                plainInput = Object.values(parsed)
                    .map(val => Array.isArray(val) ? val.join(' ') : String(val))
                    .join('\n');
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

        const response = await axios.post("http://localhost:8080/code/submit", {
            code,
            language,
            input: convertedTestCases,   // ← clean plain-text input/output
        });

        const newSubmission = new Submission({
            user: req.user._id,
            question: questionId,
            code,
            language,
            status: response.data.verdict === 'AC' ? 'Accepted' : 'Wrong Answer',
            error: response.data.error || null
        });
        await newSubmission.save();

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