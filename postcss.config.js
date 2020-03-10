/* eslint-disable global-require */
module.exports = {
    // parser: 'postcss-scss',
    plugins: () => [
        require('postcss-easy-import')({
            path: ['src', 'node_modules'],
        }),
        require('stylelint'),
        require('tailwindcss'),
        require('postcss-hexrgba'),
        require('postcss-mixins'),
        require('postcss-nested'),
        require('postcss-simple-vars'),
        require('autoprefixer'),
        require('postcss-preset-env')({ stage: 3 }),
    ],
};
