const getPostcssConfig = require('postcss-config-custom');

module.exports = getPostcssConfig(
    {
        tailwindcssOptions: {
            config: 'tailwind.config.cjs',
        },
        postcssSimpleVarsOptions: {
            variables() {
                return require('./src/styles/variables.cjs');
            }
        }
    }
)
