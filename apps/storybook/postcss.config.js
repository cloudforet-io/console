/* eslint-disable global-require, @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
    parser: 'postcss-comment',
    plugins: [
        require('postcss-easy-import')({
            path: ['../../packages/mirinae/src', 'node_modules'],
        }),
        require('tailwindcss')({ config: path.resolve(__dirname, 'tailwind.config.js') }),
        require('postcss-hexrgba'),
        require('postcss-mixins'),
        require('postcss-conditionals'),
        require('postcss-nested'),
        require('postcss-simple-vars')({
            variables() {
                return require('../../packages/mirinae/src/styles/variables.cjs');
            },
        }),
        require('autoprefixer'),
        require('postcss-preset-env')({ stage: 3 }),
    ],
};
