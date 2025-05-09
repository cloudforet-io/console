import { parseInt, replace } from 'lodash';

type RgbaString = string; // e.g. 'rgba(255, 255, 255, 1)'

export const hexToRgba = (hex: string, opacity = 1): RgbaString|undefined => {
    const _hex = replace(hex, /^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(_hex);
    return result && result.length >= 4 ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})` : undefined;
};
