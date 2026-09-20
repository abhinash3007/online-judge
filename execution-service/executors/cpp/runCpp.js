const fs = require('fs');
const { runProcess } = require('../../utils/runProcess');

const runCpp = async (exePath, input, timeLimit) => {

    return await runProcess(exePath, [], input, timeLimit);
};

module.exports = { runCpp };