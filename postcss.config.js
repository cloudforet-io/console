/* eslint-disable global-require, @typescript-eslint/no-var-requires */

module.exports = {
    parser: 'postcss-comment',
    plugins: () => {
        const res = [
            require('postcss-easy-import')({
                path: ['src', 'node_modules'],
            }),
            require('tailwindcss')({ config: 'tailwind.config.js' }),
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
        ];
        return res;
    },
};
