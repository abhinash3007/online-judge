const express = require('express');
const router = express.Router();
const {createTestCase} = require("../controllers/testCasesController");
const {verifyUser} = require("../middleware/verifyUser");

router.post("/addTestcases/:problemId/", verifyUser, createTestCase);

module.exports = router;