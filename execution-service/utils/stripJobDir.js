const path = require('path');

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Compiler and interpreter output names the file by its full path, which reveals where the
// service keeps its job folders. Remove the job folder and keep the file name, so
//   E:\...\codes\<id>\Main.java:3: error: ';' expected   →   Main.java:3: error: ';' expected
// The folder is taken from the file path itself, so nothing else in the message is touched.
// Both slash styles and any letter case are matched, because tools print Windows paths
// inconsistently; on Linux the same code strips /app/codes/<id>/.
const stripJobDir = (text, filePath) => {
    if (typeof text !== 'string' || !filePath) return text;

    const segments = path.dirname(filePath).split(/[\\/]+/);
    const pattern = segments.map(escapeRegExp).join('[\\\\/]+') + '[\\\\/]+';
    return text.replace(new RegExp(pattern, 'gi'), '');
};

module.exports = { stripJobDir };
