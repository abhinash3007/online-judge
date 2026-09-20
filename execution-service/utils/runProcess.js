const { spawn } = require('child_process');
const { killTree } = require('./killTree');
const { MAX_OUTPUT_BYTES, MEMORY_LIMIT_MB } = require('./limits');

const DEFAULT_TIME_LIMIT_MS = 2000;

// Run a program with the given stdin. Resolves { status: 'OK', output }. Rejects with a judged failure:
//   TLE  ran past the time limit          OLE  printed more than MAX_OUTPUT_BYTES
//   MLE  ran out of memory (Java heap)    RE   exited with an error
// or with a plain Error when the program could not be started at all (a server problem, not the user's).
const runProcess = (command, args, input, timeLimit = DEFAULT_TIME_LIMIT_MS) => {
    return new Promise((resolve, reject) => {

        const child = spawn(command, args, { detached: process.platform !== 'win32', windowsHide: true });

        let stdout = '';
        let stderr = '';
        let outputBytes = 0;
        let settled = false;
        let timer;

        // Settle exactly once: whichever outcome comes first wins (finished, timed out, too much output, ...).
        const finish = (settle, value) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            settle(value);
        };

        // Program could not be started (e.g. the interpreter is not installed)
        child.on('error', (err) => {
            finish(reject, new Error(`Could not start "${command}": ${err.message}`));
        });

        // input
        // A program that exits without reading all its input closes the pipe; that is not an error here.
        child.stdin.on('error', () => { });
        if (input) {
            console.log(`[runProcess] Writing to stdin (${command}):`, JSON.stringify(input), `length: ${input.length}`);
            child.stdin.write(input);
            child.stdin.end();
        } else {
            console.log(`[runProcess] No input provided for ${command}`);
            child.stdin.end();
        }

        // output, capped so a program that prints forever cannot fill the server's memory
        const collect = (append) => (data) => {
            if (settled) return;
            outputBytes += data.length;
            if (outputBytes > MAX_OUTPUT_BYTES) {
                killTree(child);
                return finish(reject, {
                    status: 'OLE',
                    error: `Output limit exceeded (${MAX_OUTPUT_BYTES / (1024 * 1024)} MB)`
                });
            }
            append(data.toString());
        };
        child.stdout.on('data', collect((s) => { stdout += s; }));
        child.stderr.on('data', collect((s) => { stderr += s; }));

        // TLE handler
        timer = setTimeout(() => {
            killTree(child);
            finish(reject, { status: 'TLE', error: `Time limit exceeded (${timeLimit / 1000}s)` });
        }, timeLimit);

        child.on('close', (code) => {
            if (code !== 0) {
                // The JVM reports running out of heap on stderr and exits with an error
                if (/OutOfMemoryError/.test(stderr)) {
                    return finish(reject, { status: 'MLE', error: `Memory limit exceeded (${MEMORY_LIMIT_MB} MB)` });
                }
                return finish(reject, { status: 'RE', error: stderr });
            }

            finish(resolve, { status: 'OK', output: stdout });
        });
    });
};

module.exports = { runProcess, DEFAULT_TIME_LIMIT_MS };
