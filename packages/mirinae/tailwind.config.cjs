const defaultConfig = require('postcss-config-custom/tailwind.config.cjs');


module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,vue}',
    ],
    theme: defaultConfig.theme,
    variants: defaultConfig.variants,
    plugins: defaultConfig.plugins,
}
