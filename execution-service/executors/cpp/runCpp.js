const fs = require('fs');
const { runProcess } = require('../../utils/runProcess');

const runCpp = async (exePath, input) => {

    return await runProcess(exePath, [], input);
};

module.exports = { runCpp };