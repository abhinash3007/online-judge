// Turns a question's time limit (in seconds) into the number of milliseconds a run is allowed.

const DEFAULT_LIMIT_SECONDS = 2;   // used when a question has no limit of its own
const MIN_LIMIT_SECONDS = 0.5;
const MAX_LIMIT_SECONDS = 10;      // safety cap: a bad value must not tie the service up

// Slower runtimes get proportionally more time (the JVM has a start-up cost, Python is slower per
// operation), so the same limit is fair to every language. Unknown languages get x1.
const LANGUAGE_FACTOR = {
    cpp: 1,
    java: 2,
    python: 3,
};

const resolveTimeLimit = (language, seconds) => {
    let base = seconds == null || seconds === '' ? DEFAULT_LIMIT_SECONDS : Number(seconds);
    if (!Number.isFinite(base)) base = DEFAULT_LIMIT_SECONDS;
    base = Math.min(MAX_LIMIT_SECONDS, Math.max(MIN_LIMIT_SECONDS, base));

    return Math.round(base * (LANGUAGE_FACTOR[language] ?? 1) * 1000);
};

module.exports = {
    resolveTimeLimit,
    DEFAULT_LIMIT_SECONDS,
    MIN_LIMIT_SECONDS,
    MAX_LIMIT_SECONDS,
    LANGUAGE_FACTOR,
};
