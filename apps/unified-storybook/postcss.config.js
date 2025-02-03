/* eslint-disable global-require, @typescript-eslint/no-var-requires */
const path = require('path');

const getPostcssConfig = require('postcss-config-custom');

module.exports = getPostcssConfig({
    tailwindcssOptions: {
        config: path.resolve(__dirname, 'tailwind.config.js'),
    },
    postcssSimpleVarsOptions: {},
    disablePostcssImport: true,
});
