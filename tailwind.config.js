const _ = require('lodash');
const plugin = require('tailwindcss/plugin');
const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('./src/styles/colors');

const rawSize = Array(81).fill('').map((value, idx) => [`${idx}`, `${idx * 0.25}rem`]);
const size = _.fromPairs(rawSize);

const rawPercent = [
    '1/12', '2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '11/12',
    '1/11', '2/11', '3/11', '4/11', '5/11', '6/11', '7/11', '8/11', '9/11', '10/11',
    '1/10', '2/10', '3/10', '4/10', '5/10', '6/10', '7/10', '8/10', '9/10',
    '1/9', '2/9', '3/9', '4/9', '5/9', '6/9', '7/9', '8/9',
    '1/8', '2/8', '3/8', '4/8', '5/8', '6/8', '7/8',
    '1/7', '2/7', '3/7', '4/7', '5/7', '6/7',
    '1/6', '2/6', '3/6', '4/6', '5/6',
    '1/5', '2/5', '3/5', '4/5',
    '1/4', '2/4', '3/4',
    '1/3', '2/3',
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
            '2px': '2px',
            '3px': '3px',
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
            xl: { min: '1920px' },
            '2xl': { min: '2560px' },
        },
    },
    variants: ['responsive', 'important'],
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
