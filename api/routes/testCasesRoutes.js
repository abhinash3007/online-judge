const express = require('express');
const router = express.Router();
const {createTestCase, deleteTestCase, getTestCases} = require("../controllers/testCasesController");
const {verifyUser} = require("../middleware/verifyUser");

router.post("/addTestcases/:problemId/", verifyUser, createTestCase);
router.delete("/deleteTestCase/:testCaseId/", verifyUser, deleteTestCase);
router.get("/getTestCases/:problemId/", getTestCases);

module.exports = router;