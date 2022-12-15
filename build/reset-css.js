// FIXME:: Where src/styles/reset.pcss has been ?
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const postcss = require('postcss');

const postcssConfig = require('../postcss.config.cjs');

console.log('processing...');

const pcss = fs.readFileSync('src/styles/reset.pcss');

postcss(postcssConfig.plugins()).process(pcss, { from: 'src/styles/reset.pcss', to: 'public/reset.css' })
    .then((result) => {
        fs.writeFileSync('public/reset.css', result.css);
        if (result.map) {
            fs.writeFileSync('public/reset.css.map', result.map.toString());
        }
        console.log('succeed');
    });
