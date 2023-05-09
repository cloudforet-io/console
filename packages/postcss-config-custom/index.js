/* eslint-disable @typescript-eslint/no-var-requires,global-require */
module.exports = ({
    tailwindcssOptions,
    postcssEasyImportOptions,
    postcssSimpleVarsOptions,
    disablePostcssImport,
}) => ({
    parser: 'postcss-comment',
    plugins: [
        require('tailwindcss')(tailwindcssOptions),
        require('postcss-easy-import')(postcssEasyImportOptions),
        ...(disablePostcssImport ? [] : [require('postcss-import')]),
        require('postcss-hexrgba'),
        require('postcss-mixins'),
        require('postcss-conditionals'),
        require('postcss-nested'),
        require('postcss-simple-vars')(postcssSimpleVarsOptions),
        require('autoprefixer'),
        require('postcss-preset-env')({ stage: 3 }),
    ],
});
