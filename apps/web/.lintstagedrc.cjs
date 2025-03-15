module.exports = {
    "**/!(*spec).{ts,tsx,js,jsx,vue}": ["eslint --fix --max-warnings=0"],
    "**/!(*spec).{ts,tsx,vue}": ["npm run ts-check"],
    "src/**/*.{css,vue,pcss,scss}": ["stylelint --fix"]
}
