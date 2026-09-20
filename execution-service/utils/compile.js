const { exec } = require('child_process');
const { killTree } = require('./killTree');
const { COMPILE_TIMEOUT_MS } = require('./limits');

// Run a compile command (javac / g++). Resolves when it succeeds; rejects with a compile-error verdict
// otherwise, including when the compiler runs past COMPILE_TIMEOUT_MS (it is killed with everything it started).
const compile = (command) => new Promise((resolve, reject) => {
    let timedOut = false;

    const child = exec(command, { windowsHide: true, detached: process.platform !== 'win32' }, (err, stdout, stderr) => {
        clearTimeout(timer);
        if (!err) return resolve();
        if (timedOut) {
            return reject({ status: 'CE', error: `Compilation timed out (${COMPILE_TIMEOUT_MS / 1000}s)` });
        }
        reject({ status: 'CE', error: stderr || err.message });
    });

    const timer = setTimeout(() => {
        timedOut = true;
        killTree(child);
    }, COMPILE_TIMEOUT_MS);
});

module.exports = { compile };
