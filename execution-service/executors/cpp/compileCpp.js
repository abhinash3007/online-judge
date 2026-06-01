const { exec } = require('child_process');
const path = require('path');

const compileCpp = (filePath) => {
    return new Promise((resolve, reject) => {

        const dir = path.dirname(filePath);
        const exePath = path.join(dir, 'a.out');

        exec(`g++ ${filePath} -o ${exePath}`, (err, stdout, stderr) => {
            if (err) {
                return reject({ status: 'CE', error: stderr });
            }
            resolve(exePath);
        });
    });
};

module.exports = { compileCpp };