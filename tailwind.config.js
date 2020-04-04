
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
    },
    variants: {},
    plugins: [],
};
