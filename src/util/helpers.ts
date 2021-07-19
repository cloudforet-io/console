import _, { get, toString } from 'lodash';
;
import colors from '@/styles/colors'
/** @function
 * @name copyTextToClipboard
 * @description copy given text to clipboard
 * @param {String} text
 * */
export const copyTextToClipboard = (t) => {
    const textArea = document.createElement('textarea');
    textArea.value = t;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('Copy');
    textArea.remove();
};

export const copyAnyData = (value) => {
    if (Array.isArray(value)) {
        copyTextToClipboard(toString(value));
    } else if (typeof value === 'object') {
        copyTextToClipboard(JSON.stringify(value));
    } else copyTextToClipboard(value || '');
};


/** @function
 * @name isNotEmpty
 * @param value
 * @returns {boolean}
 */
export const isNotEmpty = (value): boolean => {
    if (['boolean', 'number'].includes(typeof value)) return true;
    if (value instanceof Array) return !!value.length;
    return !_.isEmpty(value); // String, Object
};

export const getColor = (col?: string|null) => {
    if (!col) return col;
    if (col.startsWith('#')) return col;
    const color = get(colors, col);
    if (color) return color;
    return col;
};

export const commaFormatter = (num?: number) => {
    if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return num;
};

export const getPageStart = (thisPage: number, pageSize: number) => ((thisPage - 1) * pageSize) + 1;

export const getThisPage = (pageStart = 1, pageLimit = 15) => Math.floor(pageStart / pageLimit) || 1;
