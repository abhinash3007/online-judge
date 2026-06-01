const { exec } = require('child_process');
const path = require('path');
const { runProcess } = require('../utils/runProcess');

const executeCpp = async (filePath, inputPath) => {
    const dir = path.dirname(filePath);
    const outputExe = path.join(dir, 'a.out');

    // compile
    await new Promise((resolve, reject) => {
        exec(`g++ ${filePath} -o ${outputExe}`, (err, stdout, stderr) => {
            if (err) return reject({ status: 'CE', error: stderr });
            resolve();
        });
    });

    // read input
    const fs = require('fs');
    const input = fs.readFileSync(inputPath, 'utf-8');

    // run
    return await runProcess(outputExe, [], input);
};

module.exports = { executeCpp };






