// eslint-disable-next-line @typescript-eslint/no-var-requires
const spaceoneTailwindConfig = require('@spaceone/design-system/tailwind.config.cjs');
/**
 * Usage: https://github.com/postcss/postcss-simple-vars
 * */
module.exports = {
    'bg-color': spaceoneTailwindConfig.theme.colors.gray[100],
    'gnb-height': '3.25rem',
    'fnb-height': '2.5rem',
    'font-basic': 'Noto Sans, Roboto, arial, sans-serif',
    'font-code': 'Inconsolata, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
};
