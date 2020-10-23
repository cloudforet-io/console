const { colors } = require('tailwindcss/defaultTheme');
const { kebabCase, forEach } = require('lodash');

const palette = {
    black: '#000000',
    white: '#FFFFFF',
    pointViolet: '#7545FF',
    gray: {
        100: '#F7F7F7',
        200: '#E5E5E8',
        300: '#CED0D6',
        400: '#A7A9B2',
        500: '#858895',
        600: '#6B6E7B',
        700: '#5F616D',
        800: '#474952',
        900: '#222532',
    },
    red: {
        100: '#FFE8E8',
        200: '#FFC4C4',
        300: '#FF8F8F',
        400: '#FF6A6A',
        500: '#EF3817',
        600: '#CC2C00',
        700: '#C53030',
        800: '#9B2C2C',
        900: '#742A2A',
    },
    coral: {
        100: '#FFEBE6',
        200: '#FFD3C8',
        300: '#FFB39E',
        400: '#FF9476',
        500: '#FF7750',
        600: '#F55A2F',
        700: '#DD470F',
        800: '#B93E0F',
        900: '#8E3311',
    },
    yellow: {
        100: '#FFFAE6',
        200: '#FFEB99',
        300: '#FFE066',
        400: '#FFD633',
        500: '#FFCE02',
        600: '#E6B800',
        700: '#CCA300',
        800: '#806600',
        900: '#4D3D00',
    },
    green: {
        100: '#F9FCE9',
        200: '#E7F3A5',
        300: '#D5EA62',
        400: '#C2E01E',
        500: '#60B731',
        600: '#3F7B1A',
        700: '#366916',
        800: '#203F0D',
        900: '#162A09',
    },
    blue: {
        100: '#F5F9FD',
        200: '#E9F4FF',
        300: '#B9DCFF',
        400: '#43BEFF',
        500: '#007EE5',
        600: '#0069CC',
        700: '#005CB3',
        800: '#004F99',
        900: '#003566',
    },
    violet: {
        100: '#F8F8FC',
        200: '#EBEAF6',
        300: '#A8A5CE',
        400: '#8C81D1',
        500: '#6638B6',
        600: '#58309C',
        700: '#4D2A89',
        800: '#3C2C84',
        900: '#371E62',
    },
};
const colorSet = {
    transparent: 'transparent',
    black: palette.black,
    white: palette.white,
    pointViolet: palette.pointViolet,
    gray: {
        ...palette.gray,
        default: palette.gray[500],
        dark: palette.gray[900],
    },
    red: {
        ...palette.red,
        default: palette.red[500],
    },
    coral: {
        ...palette.coral,
        default: palette.coral[500],
    },
    yellow: {
        ...palette.yellow,
        default: palette.yellow[500],
    },
    green: {
        ...palette.green,
        default: palette.green[500],
    },
    blue: {
        ...palette.blue,
        default: palette.blue[500],
    },
    violet: {
        ...palette.violet,
        default: palette.violet[500],
    },
    peacock: {
        ...colors.teal,
        default: colors.teal[500],
    },
    indigo: {
        ...colors.indigo,
        default: colors.indigo[500],
    },
};


const semanticColors = {
    primary: palette.violet[500],
    primaryDark: palette.violet[800],
    primary1: palette.violet[400],
    primary2: palette.violet[300],
    primary3: palette.violet[200],
    primary4: palette.violet[100],
    secondary: palette.blue[500],
    secondary1: palette.blue[400],
    secondary2: palette.blue[100],
    alert: palette.red[500],
    safe: palette.green[500],
};

const kebabColors = {};
forEach(semanticColors, (d, k) => { kebabColors[kebabCase(k)] = d; });
forEach(colorSet, (d, k) => { kebabColors[kebabCase(k)] = d; });


module.exports = {
    ...semanticColors,
    ...colorSet,
    ...kebabColors,
};
