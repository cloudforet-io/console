// eslint-disable-next-line @typescript-eslint/no-var-requires
const { palette, semanticColors, colorSet } = require('mirinae-foundation/colors.cjs');

module.exports = {
    palette,
    semanticColors,

    /* colors */
    ...semanticColors,
    ...colorSet,
};
