/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const postcss = require('postcss');

const postcssConfig = require('../postcss.config.cjs');

console.log('pcss to css processing...');
const destDir = 'css';
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
}

const pcssToCss = (fileName, sourceFile) => {
    const file = fs.readFileSync(sourceFile);
    const destFile = `${destDir}/${fileName}`;

    postcss(postcssConfig.plugins).process(file, { from: sourceFile, to: destFile })
        .then((result) => {
            fs.writeFileSync(destFile, result.css);
            console.log(`succeed to write ${fileName}`);
            if (result.map) {
                fs.writeFileSync(`${destFile}.map`, result.map.toString());
                console.log(`succeed to write ${fileName}`);
            }
        });
};

pcssToCss('light-style.css', 'src/styles/light-style.pcss');
pcssToCss('style.css', 'src/styles/style.pcss');

pcssToCss('reset.css', 'src/styles/reset.pcss');
pcssToCss('tailwind.css', 'src/styles/tailwind.pcss');

pcssToCss('PTooltip.css', 'src/data-display/tooltips/PTooltip.pcss');
