const _ = require('lodash');
const plugin = require('tailwindcss/plugin');
const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('./src/styles/colors').tailwindColors;

const rawSize = Array(32)
    .fill('')
    .map((value, idx) => [`${idx}`, `${idx * 0.25}rem`]);
const size = _.fromPairs(rawSize);

const rawPercent = [
    '1/2',
];

// eslint-disable-next-line no-eval
const percent = _.fromPairs(rawPercent.map(value => [value, `${eval(value) * 100}%`]));
module.exports = {
    theme: {
        colors,
        spacing: {
            ...defaultTheme.spacing,
            px: '1px',
            ...size,
        },
        minWidth: theme => ({
            ...defaultTheme.minWidth,
            ...theme('spacing'),
            ...percent,
        }),
        maxWidth: (theme, args) => ({
            ...defaultTheme.maxWidth(theme, args),
            ...theme('spacing'),
            ...percent,

        }),
        minHeight: theme => ({
            ...defaultTheme.minHeight,
            ...theme('spacing'),
            ...percent,
        }),
        maxHeight: theme => ({
            ...defaultTheme.maxHeight,
            ...theme('spacing'),
            ...percent,
        }),
        fontFamily: {
            sans: ['Noto Sans'],
            serif: ['Roboto'],
        },
        screens: {
            '2xs': { min: '375px' },
            xs: { min: '478px' },
            sm: { min: '576px' },
            md: { min: '768px' },
            lg: { min: '1024px' },
            xl: { min: '1368px' },
            '2xl': { min: '1920px' },
            '3xl': { min: '2560px' },
        },
    },
    variants: ['responsive', 'important', 'hover'],
    plugins: [
        plugin(({ addVariant }) => {
            addVariant('important', ({ container }) => {
                container.walkRules((rule) => {
                    rule.selector = `.\\!${rule.selector.slice(1)}`;
                    rule.walkDecls((decl) => {
                        decl.important = true;
                    });
                });
            });
        }),
    ],
};
