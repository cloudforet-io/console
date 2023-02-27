// const { colors } = require('tailwindcss/defaultTheme');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { kebabCase, forEach } = require('lodash');

const palette = {
    black: '#000000',
    white: '#FFFFFF',
    pointViolet: '#7545FF',
    gray: {
        100: '#F7F7F7',
        200: '#DDDDDF',
        300: '#C2C2C6',
        400: '#A7A9B2',
        500: '#898995',
        600: '#6B6E7B',
        700: '#515364',
        800: '#383B4C',
        900: '#232533',
    },
    red: {
        100: '#FFF0F0',
        200: '#FFC1C1',
        300: '#FF9292',
        400: '#FF6A6A',
        500: '#EA4646',
        600: '#CE2C2C',
        700: '#AD1B1B',
        800: '#881010',
        900: '#660A0A',
    },
    coral: {
        100: '#FFF0ED',
        200: '#FFD4C8',
        300: '#FFB5A0',
        400: '#FF9476',
        500: '#E8704D',
        600: '#CA4F28',
        700: '#A6320B',
        800: '#7E2200',
        900: '#591900',
    },
    yellow: {
        100: '#FFFAE6',
        200: '#FFF3A7',
        300: '#FFE968',
        400: '#FFDD2F',
        500: '#FFCE02',
        600: '#D9AE00',
        700: '#AB8900',
        800: '#7B6200',
        900: '#4D3D00',
    },
    green: {
        100: '#F9FCE8',
        200: '#E8F9B8',
        300: '#CDF18A',
        400: '#ACE564',
        500: '#87D247',
        600: '#60B731',
        700: '#50911C',
        800: '#38670E',
        900: '#234006',
    },
    blue: {
        100: '#F3F7FC',
        200: '#E0F2FF',
        300: '#B4DFFF',
        400: '#86C8FF',
        500: '#49A7F7',
        600: '#007EE5',
        700: '#0062B8',
        800: '#004687',
        900: '#002D59',
    },
    violet: {
        100: '#F8F8FC',
        200: '#E1E0FA',
        300: '#B7AFED',
        400: '#897CD6',
        500: '#7D5DD2',
        600: '#6638B6',
        700: '#48248C',
        800: '#341470',
        900: '#2C0F66',
    },
    indigo: {
        100: '#EBF3FF',
        200: '#C5DEFF',
        300: '#9FC0FC',
        400: '#7F9CF5',
        500: '#5F77E2',
        600: '#4651C8',
        700: '#3933A9',
        800: '#382486',
        900: '#331A66',
    },
    peacock: {
        100: '#E8FCF9',
        200: '#BBF8EF',
        300: '#90F0E5',
        400: '#6CE4D7',
        500: '#4FD1C5',
        600: '#37B6AE',
        700: '#259490',
        800: '#186F6E',
        900: '#0F4D4D',
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
        default: palette.green[600],
    },
    blue: {
        ...palette.blue,
        default: palette.blue[600],
    },
    violet: {
        ...palette.violet,
        default: palette.violet[600],
    },
    peacock: {
        ...palette.peacock,
        default: palette.peacock[600],
    },
    indigo: {
        ...palette.indigo,
        default: palette.indigo[500],
    },
};


const semanticColors = {
    primary: palette.violet[600],
    primaryDark: palette.violet[800],
    primary1: palette.violet[400],
    primary2: palette.violet[300],
    primary3: palette.violet[200],
    primary4: palette.violet[100],
    secondary: palette.blue[600],
    secondaryDark: palette.blue[800],
    secondary1: palette.blue[500],
    secondary2: palette.blue[100],
    alert: palette.red[500],
    safe: palette.green[600],
};

const kebabColors = {};
forEach(semanticColors, (d, k) => { kebabColors[kebabCase(k)] = d; });
forEach(colorSet, (d, k) => { kebabColors[kebabCase(k)] = d; });


module.exports = {
    /* color sets */
    tailwindColors: {
        ...semanticColors,
        ...kebabColors,
    },
    palette,
    semanticColors,

    /* colors */
    ...semanticColors,
    ...colorSet,
};
