// Resource limits applied to every submitted program. Kept in one place so they are easy to tune.
// (The time limit is per question, see timeLimit.js.)

const MEMORY_LIMIT_MB = 256;                // Java heap for a run (-Xmx); exceeding it is reported as MLE
const MAX_OUTPUT_BYTES = 1024 * 1024;       // stdout + stderr of one run; exceeding it is reported as OLE
const COMPILE_TIMEOUT_MS = 10 * 1000;       // javac / g++; a compile that takes longer is killed and reported as CE

module.exports = { MEMORY_LIMIT_MB, MAX_OUTPUT_BYTES, COMPILE_TIMEOUT_MS };
