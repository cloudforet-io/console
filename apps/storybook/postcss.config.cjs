const path = require('path');

const getPostcssConfig = require('postcss-config-custom');

module.exports = getPostcssConfig({
    tailwindcssOptions: {
        config: path.resolve(__dirname, 'tailwind.config.cjs'),
    },
    postcssEasyImportOptions: {
        path: ['@cloudforet/mirinae/src', 'node_modules'],
    },
    postcssSimpleVarsOptions: {
        variables() {
            return require('@cloudforet/mirinae/src/styles/variables.cjs');
        },
    },
    disablePostcssImport: true,
});
