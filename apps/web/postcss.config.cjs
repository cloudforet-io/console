module.exports = {
    parser: 'postcss-comment',
    plugins: [
        require('tailwindcss')({ config: 'tailwind.config.cjs' }),
        require('autoprefixer'),
        require('postcss-easy-import'),
        require('postcss-import'),
        require('postcss-hexrgba'),
        require('postcss-mixins'),
        require('postcss-conditionals'),
        require('postcss-nested'),
        require('postcss-simple-vars')({
            variables() {
                return require('./src/styles/variables.cjs');
            },
        }),
        require('postcss-preset-env')
    ],
}
