const fs = require("fs");

function cleanup(filePath, inputPath) {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        if (inputPath && fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }
    } catch (err) {
        console.log("Cleanup error:", err.message);
    }
}

module.exports = { cleanup };