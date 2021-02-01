/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '../src/assets/lottiefiles/');
const destPath = path.join(__dirname, '../src/foundation/lottie/p-lotties/');

const lottieFileNames = fs.readdirSync(sourcePath)
    .filter(d => path.extname(d).toLowerCase() === '.json');
console.log(`Lottie files at ${sourcePath}: \n`, lottieFileNames);

lottieFileNames.forEach((d) => {
    fs.copyFile(`${sourcePath}${d}`, `${destPath}${d}`, (e) => {
        if (e) console.error(`Failed to copy ${d}`, e);
        else console.log(`Succeed to copy ${d}`);
    });
});


fs.writeFile(`${destPath}names.js`, `
    export const names = [${lottieFileNames ? lottieFileNames.map(d => `'${d.slice(0, d.length - 5)}'`) : ''}];
`, (e) => {
    if (e) console.error('Failed to write names.js', e);
    else console.log('Succeed to write names.js');
});
