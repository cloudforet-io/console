
const plugin = require('tailwindcss/plugin');
const colors = require('./src/styles/colors');

module.exports = {
    theme: {
        colors,
        maxHeight: {
            0: '0',
            '1/4': '25%',
            '1/3': '33%',
            '1/2': '50%',
            '2/3': '66%',
            '3/4': '75%',
            full: '100%',
        },
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
