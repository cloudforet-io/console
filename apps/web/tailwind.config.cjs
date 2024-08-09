/* eslint-disable @typescript-eslint/no-var-requires */
const spaceoneTailwindConfig = require('@cloudforet/mirinae/tailwind.config.cjs');

module.exports = {
    purge: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx,vue}",
    ],
    theme: spaceoneTailwindConfig.theme,
    variants: spaceoneTailwindConfig.variants,
    plugins: spaceoneTailwindConfig.plugins,
};
