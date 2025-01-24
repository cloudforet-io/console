/* eslint-disable global-require, @typescript-eslint/no-var-requires */
const path = require('path');

const getPostcssConfig = require('postcss-config-custom');

module.exports = getPostcssConfig({
    tailwindcssOptions: {
        config: path.resolve(__dirname, 'tailwind.config.js'),
    },
    postcssEasyImportOptions: {
        path: ['../../packages/mirinae/src', 'node_modules'],
    },
    postcssSimpleVarsOptions: {
        variables() {
            return require('../../packages/mirinae/src/styles/variables.cjs');
        },
    },
    disablePostcssImport: true,
});
