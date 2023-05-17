/* eslint-disable */

const path = require('path');
const util = require('util');

const fs = require('fs-plus');

const readdirAsync = util.promisify(fs.readdir);
const writeFileAsync = util.promisify(fs.writeFile);

async function generate(options) {
    const {
        sourcePath, targetPath,
    } = options;

    fs.removeSync(targetPath);
    const targetFile = path.join(targetPath, 'icons.js');

    try {
        const files = await readdirAsync(sourcePath);
        const svgFiles = files.filter((file) => path.extname(file).toLowerCase() === '.svg');

        const fileNames = svgFiles.map((file) => path.basename(file, '.svg'));
        const fileImportContent = fileNames.map((key) => `import ${snakeToCamel(key)} from '${path.relative(targetPath, sourcePath)}/${key}.svg';\n`).join('');
        const iconContent = `\n\nexport default {\n${fileNames.map((key) => `    '${key}': ${snakeToCamel(key)},\n`).join('')}};\n`;

        await writeFileAsync(targetFile, fileImportContent + iconContent);
        console.log('file write success');
    } catch (err) {
        console.log('file write error:', err);
    }
}

function snakeToCamel(str) {
    return str.replace(/([-]\w)/g, (match) => match[1].toUpperCase());
}

module.exports = {
    generate,
};
