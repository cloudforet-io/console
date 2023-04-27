const getPostcssConfig = require('postcss-config-custom');

module.exports = getPostcssConfig(
    {
        tailwindcssOptions: {
            config: 'tailwind.config.cjs',
        },
        postcssEasyImportOptions: {
            path: ['src', 'node_modules'],
        },
        postcssSimpleVarsOptions: {
            variables() {
                return require('./src/styles/variables.cjs');
            }
        }
    }
)
