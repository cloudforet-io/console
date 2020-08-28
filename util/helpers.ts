import _, { get, toString } from 'lodash';
import colors from '@/components/styles/colors';

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
    return get(colors, col);
};
