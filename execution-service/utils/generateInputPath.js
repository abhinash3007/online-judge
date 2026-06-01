const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dirInputs = path.join(__dirname, '..', 'inputs');

// Ensure inputs directory exists
if (!fs.existsSync(dirInputs)) {
    fs.mkdirSync(dirInputs, { recursive: true });
}

const generateInputPath = async (input = "") => {
    // Create unique file name
    const fileName = `${uuidv4()}.txt`;

    // Full file path
    const filePath = path.join(dirInputs, fileName);

    // Write input to file
    await fs.promises.writeFile(filePath, input);

    return filePath;
};

module.exports = { generateInputPath };