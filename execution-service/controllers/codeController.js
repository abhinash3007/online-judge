const { generateFilePath } = require('../utils/generateFilePath');
const { generateInputPath } = require('../utils/generateInputPath');
const { cleanup } = require('../utils/cleanupFilePath');
const { executeCpp } = require('../executors/executeCPP');
const { executePython } = require('../executors/executePython');
const { executeJava } = require('../executors/executeJava');
const { compileCpp } = require('../executors/cpp/compileCpp');
const { runCpp } = require('../executors/cpp/runCpp');

module.exports.executeCode = async (req, res) => {
    const { code, language, input, expectedOutput } = req.body;
    console.log("Received code execution request:", { language, code, input, expectedOutput });

    try {
        const fileObj = await generateFilePath(code, language);
        const filePath = fileObj.filePath;
        console.log("Generated file path:", filePath);

        const inputFilePath = await generateInputPath(input);
        console.log("Generated input file path:", inputFilePath);

        let result;

        if (language === 'cpp') {
            result = await executeCpp(filePath, inputFilePath);
        } else if (language === 'python') {
            result = await executePython(filePath, inputFilePath);
        } else if (language === 'java') {
            result = await executeJava(filePath, inputFilePath);
        } else {
            return res.status(400).json({ error: 'Unsupported language' });
        }

        // Judge logic
        if (result.status === 'TLE') {
            return res.json({ verdict: 'TLE' });
        }

        if (result.status === 'RE') {
            return res.json({ verdict: 'RE', error: result.error });
        }

        const actual = result.output.trim();
        const expected = (expectedOutput || '').trim();

        // Only compare if expectedOutput was actually provided
        const verdict = expected === '' ? 'OK' : (actual === expected ? 'AC' : 'WA');

        return res.json({
            verdict,
            output: actual
        });

    } catch (err) {
        return res.status(500).json({
            verdict: err.status || 'Error',
            error: err.error || err.message
        });
    }
    finally {
        cleanup(filePath, inputFilePath);
    }
};


// module.exports.submitCode = async (req, res) => {
//     const { code, language, input } = req.body;

//     try {
//         const fileObj = await generateFilePath(code, language);
//         const filePath = fileObj.filePath;

//         let executor;
//         if (language === 'cpp') executor = executeCpp;
//         else if (language === 'python') executor = executePython;
//         else if (language === 'java') executor = executeJava;
//         else return res.status(400).json({ error: 'Unsupported language' });

//         let passed = 0;
//         const results = [];

//         for (const tc of input) {

//             const inputPath = await generateInputPath(tc.input);

//             const result = await executor(filePath, inputPath);

//             const actual = (result.output || '').trim();
//             const expected = (tc.output || '').trim();

//             const verdict = actual === expected ? 'AC' : 'WA';

//             if (verdict === 'AC') passed++;

//             results.push({
//                 input: tc.input,
//                 expected,
//                 got: actual,
//                 verdict
//             });
//         }

//         return res.json({
//             verdict: passed === input.length ? 'AC' : 'WA',
//             passed,
//             total: input.length,
//             results
//         });

//     } catch (err) {
//         return res.status(500).json({
//             verdict: err.status || 'ERROR',
//             error: err.message
//         });
//     }
// };


module.exports.submitCode = async (req, res) => {
    const { code, language, input } = req.body;

    let filePath; 

    try {
        const fileObj = await generateFilePath(code, language);
        filePath = fileObj.filePath;

        let compiledArtifact = null;

        if (language === 'cpp') {
            compiledArtifact = await compileCpp(filePath);
        }

        let passed = 0;

        for (const tc of input) {
            let inputPath;

            try {
                if (!tc.input) {
                    return res.status(400).json({
                        error: 'Test case input is empty',
                        testCase: tc
                    });
                }

                inputPath = await generateInputPath(tc.input);

                let result;

                if (language === 'cpp') {
                    result = await runCpp(compiledArtifact, inputPath);
                } else if (language === 'python') {
                    result = await executePython(filePath, inputPath);
                } else if (language === 'java') {
                    result = await executeJava(filePath, inputPath);
                }

                const actual = (result.output || '').trim();
                const expected = (tc.output || '').trim();

                if (result.status === 'TLE') {
                    return res.json({
                        verdict: 'TLE',
                        passed,
                        total: input.length
                    });
                }

                if (actual !== expected) {
                    return res.json({
                        verdict: 'WA',
                        passed,
                        total: input.length,
                        input: tc.input,
                        expected,
                        got: actual
                    });
                }

                passed++;

            } finally {
                if (inputPath) cleanup(null, inputPath);
            }
        }

        return res.json({
            verdict: 'AC',
            passed,
            total: input.length
        });

    } catch (err) {
        return res.status(500).json({
            verdict: 'RE',
            error: err.message
        });

    } finally {
        if (filePath) cleanup(filePath, null);
    }
};