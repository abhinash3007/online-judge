const fs = require('fs');
const { runProcess } = require('../utils/runProcess');

const executePython = async (filePath, inputPath, timeLimit) => {
    const input = fs.readFileSync(inputPath, 'utf-8');

    return await runProcess('python3', [filePath], input, timeLimit);
};

module.exports = { executePython };