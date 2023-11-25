const getPostcssConfig = require('postcss-config-custom');

module.exports = getPostcssConfig(
    {
        tailwindcssOptions: {
            config: 'tailwind.config.cjs',
        }
    }
)