const fs = require('fs');
const path = require('path');
const { runProcess } = require('../utils/runProcess');
const { compile } = require('../utils/compile');
const { MEMORY_LIMIT_MB } = require('../utils/limits');

const executeJava = async (filePath, inputPath, timeLimit) => {
    const dir = path.dirname(filePath);
    const input = fs.readFileSync(inputPath, 'utf-8');

    // compile
    await compile(`javac ${filePath}`);

    // run, with the heap capped so a program that allocates without end fails instead of using all the RAM
    return await runProcess(
        'java',
        [`-Xmx${MEMORY_LIMIT_MB}m`, '-cp', dir, 'Main'],
        input,
        timeLimit
    );
};

module.exports = { executeJava };
