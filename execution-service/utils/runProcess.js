const { spawn } = require('child_process');

const DEFAULT_TIME_LIMIT_MS = 2000;

const runProcess = (command, args, input, timeLimit = DEFAULT_TIME_LIMIT_MS) => {
    return new Promise((resolve, reject) => {

        const process = spawn(command, args);

        let stdout = '';
        let stderr = '';

        // input
        if (input) {
            console.log(`[runProcess] Writing to stdin (${command}):`, JSON.stringify(input), `length: ${input.length}`);
            process.stdin.write(input);
            process.stdin.end();
        } else {
            console.log(`[runProcess] No input provided for ${command}`);
            process.stdin.end();
        }

        // output
        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        // TLE handler
        const timer = setTimeout(() => {
            process.kill('SIGKILL');
            reject({ status: 'TLE', error: `Time limit exceeded (${timeLimit / 1000}s)` });
        }, timeLimit);

        process.on('close', (code) => {
            clearTimeout(timer);

            if (code !== 0) {
                return reject({
                    status: 'RE',
                    error: stderr
                });
            }

            resolve({
                status: 'OK',
                output: stdout
            });
        });
    });
};

module.exports = { runProcess, DEFAULT_TIME_LIMIT_MS };
