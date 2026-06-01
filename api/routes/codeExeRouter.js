const express = require('express');
const { executeCode, submitCode, reviewCode } = require('../controllers/codeController');
const { verifyUser } = require('../middleware/verifyUser');
const router = express.Router();

router.post('/run', verifyUser, executeCode);
router.post('/submit', verifyUser, submitCode);
router.post('/review', verifyUser, reviewCode);

module.exports = router;