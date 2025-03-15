module.exports = {
    '**/*.{ts,tsx,js,jsx,vue}': ['eslint --fix --max-warnings=0'],
    '**/*.{ts,tsx,vue}': ['vue-tsc -p tsconfig.json --noEmit'],
    'src/**/*.{css,vue,pcss,scss}': ['stylelint --fix'],
};
