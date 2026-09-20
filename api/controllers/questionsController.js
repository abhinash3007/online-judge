const Question = require("../models/question");

const MIN_TIME_LIMIT = 0.5;
const MAX_TIME_LIMIT = 10;

// Returns null when `value` is a usable time limit in seconds, otherwise the error message to send back.
const timeLimitError = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < MIN_TIME_LIMIT || n > MAX_TIME_LIMIT) {
        return `Time limit must be a number of seconds between ${MIN_TIME_LIMIT} and ${MAX_TIME_LIMIT}`;
    }
    return null;
};

module.exports.createQuestion = async (req, res) => {
    try {
        const { title, description, difficulty, inputFormat, outputFormat, constraints, topic, timeLimit } = req.body;

        if (!title || !description || !difficulty || !inputFormat || !outputFormat || !constraints || !topic) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Optional: left out, the question gets the model's default limit
        if (timeLimit !== undefined && timeLimit !== "") {
            const problem = timeLimitError(timeLimit);
            if (problem) return res.status(400).json({ success: false, message: problem });
        }

        const slug = title.trim().toLowerCase().replace(/\s+/g, "-");

        const existing = await Question.findOne({ slug });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Question with same title already exists",
            });
        }

        const question = await Question.create({
            title,
            description,
            difficulty,
            inputFormat,
            outputFormat,
            constraints,
            topic,
            slug,
            ...(timeLimit !== undefined && timeLimit !== "" && { timeLimit: Number(timeLimit) }),
            user: req.user._id,
        });

        res.status(201).json({ success: true, question });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating question",
            error: error.message,
        });
    }
};

module.exports.getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching questions",
            error: error.message,
        });
    }
};

module.exports.getOneQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findById(id).populate("user", "name email");

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        res.json({ success: true, question });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching question",
            error: error.message,
        });
    }
};

module.exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, difficulty, inputFormat, outputFormat, constraints, topic, timeLimit } = req.body;

        const question = await Question.findById(id);

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

        if (title) {
            question.title = title;
            question.slug = title.trim().toLowerCase().replace(/\s+/g, "-");
        }

        if (description) question.description = description;
        if (difficulty) question.difficulty = difficulty;
        if (inputFormat) question.inputFormat = inputFormat;
        if (outputFormat) question.outputFormat = outputFormat;
        if (constraints) question.constraints = constraints;
        if (topic) question.topic = topic;
        if (timeLimit !== undefined && timeLimit !== "") {
            const problem = timeLimitError(timeLimit);
            if (problem) return res.status(400).json({ success: false, message: problem });
            question.timeLimit = Number(timeLimit);
        }

        await question.save();

        res.json({ success: true, question });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating question",
            error: error.message,
        });
    }
};

module.exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findById(id);

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

        await Question.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Question deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting question",
            error: error.message,
        });
    }
};