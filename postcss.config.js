/* eslint-disable global-require, @typescript-eslint/no-var-requires */

module.exports = {
    plugins: () => {
        const res = [
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
        ];
        if (process.env.NODE_ENV === 'production') {
            res.push(require('@fullhuman/postcss-purgecss')({
                content: ['./public/**/*.html', './src/**/*.vue'],
                defaultExtractor: (content) => {
                    const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '');
                    return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || [];
                },
                whitelistPatterns: [/-(leave|enter|appear)(|-(to|from|active))$/, /^(?!cursor-move).+-move$/, /^router-link(|-exact)-active$/],
            }));
        }
        return res;
    },
};
