// eslint-disable-next-line @typescript-eslint/no-var-requires
const tailwindConfig = require('postcss-config-custom/tailwind.config.cjs');

module.exports = {
    content: [
        '../../packages/mirinae/src/**/*.{js,ts,jsx,tsx,vue}',
    ],
    theme: tailwindConfig.theme,
    variants: tailwindConfig.variants,
    plugins: tailwindConfig.plugins,
};
