const fs = require('fs');
const path = require('path');
const { runProcess } = require('../utils/runProcess');
const { compile } = require('../utils/compile');

const executeCpp = async (filePath, inputPath, timeLimit) => {
    const dir = path.dirname(filePath);
    const outputExe = path.join(dir, 'a.out');

    // compile
    await compile(`g++ ${filePath} -o ${outputExe}`);

    // read input
    const input = fs.readFileSync(inputPath, 'utf-8');

    // run
    return await runProcess(outputExe, [], input, timeLimit);
};

module.exports = { executeCpp };
