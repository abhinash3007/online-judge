
const express = require('express');
const router = express.Router();

const { executeCode, submitCode } = require('../controllers/codeController');

router.post('/execute', executeCode);
router.post('/submit', submitCode);

module.exports = router;