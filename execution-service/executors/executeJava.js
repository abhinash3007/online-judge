const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { runProcess } = require('../utils/runProcess');

const executeJava = async (filePath, inputPath) => {
    const dir = path.dirname(filePath);
    const input = fs.readFileSync(inputPath, 'utf-8');

    // compile
    await new Promise((resolve, reject) => {
        exec(`javac ${filePath}`, (err, stdout, stderr) => {
            if (err) return reject({ status: 'CE', error: stderr });
            resolve();
        });
    });

    // run
    return await runProcess(
        'java',
        ['-cp', dir, 'Main'],
        input
    );
};

module.exports = { executeJava };