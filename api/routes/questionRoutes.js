const express = require("express");
const router = express.Router();
const {createQuestion, deleteQuestion, updateQuestion, getAllQuestions, getOneQuestion} = require("../controllers/questionsController");
const { verifyUser } = require("../middleware/verifyUser");

router.post("/create", verifyUser, createQuestion);
router.get("/all", getAllQuestions);
router.get("/:id", getOneQuestion);
router.put("/update/:id", verifyUser, updateQuestion);
router.delete("/delete/:id", verifyUser, deleteQuestion);

module.exports = router;