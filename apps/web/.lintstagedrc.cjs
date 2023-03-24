module.exports = {
    "**/*.{ts,tsx,js,jsx,vue}": ["eslint --fix --max-warnings=0"],
    "src/**/*.{css,vue,pcss,scss}": ["stylelint --fix"]
}
