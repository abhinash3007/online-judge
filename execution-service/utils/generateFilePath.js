const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const generateFilePath = async (code, language) => {

    // Create unique job folder
    const jobId = uuidv4();

    const jobDir = path.join(__dirname, '..', 'codes', jobId);

    // Create directory
    await fs.promises.mkdir(jobDir, { recursive: true });

    // Extensions
    const extensionMap = {
        cpp: 'cpp',
        python: 'py',
        java: 'java'
    };

    let fileName;

    // Java file must be Main.java
    if (language === 'java') {
        fileName = 'Main.java';
    } else {
        fileName = `code.${extensionMap[language]}`;
    }

    const filePath = path.join(jobDir, fileName);  //E:/ONLINE_JUDGE/execution-service/codes/f71f2f47/code.cpp

    // Write code to file
    await fs.promises.writeFile(filePath, code);

    return {
        jobId,
        filePath
    };
};

module.exports = { generateFilePath };