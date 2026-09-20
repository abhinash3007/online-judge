const fs = require('fs');
const { runProcess } = require('../../utils/runProcess');

const runCpp = async (exePath, inputPath, timeLimit) => {

    const input = fs.readFileSync(inputPath, 'utf-8');

    return await runProcess(exePath, [], input, timeLimit);
};

module.exports = { runCpp };