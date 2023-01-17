import {
    isEmpty, get, toString,
} from 'lodash';

import colors from '@/styles/colors.cjs';

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
        copyTextToClipboard(toString(value).trim());
    } else if (typeof value === 'object') {
        copyTextToClipboard(JSON.stringify(value).trim());
    } else copyTextToClipboard(value.trim() || '');
};


/** @function
 * @name isNotEmpty
 * @param value
 * @returns {boolean}
 */
export const isNotEmpty = (value): boolean => {
    if (['boolean', 'number'].includes(typeof value)) return true;
    if (value instanceof Array) return !!value.length;
    return !isEmpty(value); // String, Object
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

export const getContextKey = (): string => Math.floor(Math.random() * Date.now()).toString();

// if additional exception words are found, must be added.
const searchInputRegex = ['[', '?', '\\', '^', '+', '$', '*', '.', '|'];
export const getTextHighlightRegex = (term?: string|number) => {
    let regex = '';
    if (typeof term === 'string') {
        // remove spaces in the search term
        const text = term.replace(/\s/g, '');
        for (let i = 0; i < text.length; i++) {
            const currentIndexText = text[i];
            if (searchInputRegex.includes(currentIndexText)) {
                // add escape character in '[?\^+$*.|', because RegExp can't accept just that words.
                regex += `\\${currentIndexText}`;
            } else {
                regex += currentIndexText;
            }
            // add space regex after every single character to find matching keywords ignoring spaces
            if (i < text.length - 1) regex += '\\s*';
        }
    } else if (typeof term === 'number') {
        regex = `${term}`;
    }
    return new RegExp(regex, 'i');
};
