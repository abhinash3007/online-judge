const path = require('path');
const { compile } = require('../../utils/compile');

const compileCpp = async (filePath) => {
    const dir = path.dirname(filePath);
    const exePath = path.join(dir, 'a.out');

    await compile(`g++ ${filePath} -o ${exePath}`);
    return exePath;
};

module.exports = { compileCpp };
