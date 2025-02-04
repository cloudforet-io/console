// eslint-disable-next-line @typescript-eslint/no-var-requires
const tailwindConfig = require('postcss-config-custom/tailwind.config.cjs');

module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,vue}',
    ],
    theme: tailwindConfig.theme,
    variants: tailwindConfig.variants,
    plugins: tailwindConfig.plugins,
};
