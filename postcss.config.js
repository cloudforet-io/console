/* eslint-disable global-require, @typescript-eslint/no-var-requires */

module.exports = {
    plugins: () => [
        require('postcss-easy-import')({
            path: ['src', 'node_modules'],
        }),
        require('tailwindcss'),
        require('postcss-hexrgba'),
        require('postcss-mixins'),
        require('postcss-conditionals'),
        require('postcss-nested'),
        require('postcss-simple-vars')({
            variables() {
                return require('./src/styles/variables');
            },
        }),
        require('autoprefixer'),
        require('postcss-preset-env')({ stage: 3 }),
    ],
};
