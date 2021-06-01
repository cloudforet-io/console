// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('lodash');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require('tailwindcss/plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
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
        borderRadius: {
            none: '0',
            sm: '0.125rem', // 2px
            md: '0.25rem', // 4px
            default: '0.25rem', // 4px
            lg: '0.375rem', // 6px
            xl: '0.5rem', // 8px
            '2xl': '0.75rem', // 12px
            full: '50%',
        },
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
            '2xs': theme('screens.2xs.min'),
            xs: theme('screens.xs.min'),
            sm: theme('screens.sm.min'),
            md: theme('screens.md.min'),
            lg: theme('screens.lg.min'),
            xl: theme('screens.xl.min'),
            '2xl': theme('screens.2xl.min'),
            '3xl': theme('screens.3xl.min'),
        }),
        maxWidth: (theme, args) => ({
            ...defaultTheme.maxWidth(theme, args),
            ...theme('spacing'),
            ...percent,
            mobile: theme('screens.mobile.max'),
            tablet: theme('screens.tablet.max'),
            laptop: theme('screens.laptop.max'),
            desktop: theme('screens.desktop.max'),
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
            xl: { min: '1440px' },
            '2xl': { min: '1920px' },
            '3xl': { min: '2560px' },
            mobile: { max: '767px' },
            tablet: { max: '1023px' },
            laptop: { max: '1440px' },
            desktop: { max: '1920px' },
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
