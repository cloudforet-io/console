// eslint-disable-next-line import/no-extraneous-dependencies
import { create } from '@storybook/theming/create';

export default create({
    base: 'light',
    colorPrimary: '#6638B6',
    colorSecondary: 'rgba(102, 56, 182, 0.9)',

    // UI
    appBg: 'white',
    appContentBg: 'white',
    appBorderColor: 'silver',
    appBorderRadius: 4,

    // Text colors
    textColor: 'black',
    textInverseColor: 'rgba(255,255,255,0.9)',

    // Toolbar default and active colors
    barTextColor: 'silver',
    barSelectedColor: '#6638B6',
    barBg: 'white',

    // Form colors
    inputBg: 'white',
    inputBorder: 'silver',
    inputTextColor: 'black',
    inputBorderRadius: 4,

    brandTitle: 'Mirinae Design System',
    brandUrl: 'https://github.com/cloudforet-io/mirinae',
    brandImage: './images/SpaceONE_logoTypeA.svg',
});
