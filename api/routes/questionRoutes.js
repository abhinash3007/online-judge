const express = require("express");
const router = express.Router();
const {createQuestion, deleteQuestion, updateQuestion, getAllQuestions, getOneQuestion} = require("../controllers/questionsController");

router.post("/create", createQuestion);
router.get("/all", getAllQuestions);
router.get("/:id", getOneQuestion);
router.put("/update/:id", updateQuestion);
router.delete("/delete/:id", deleteQuestion);

module.exports = router;