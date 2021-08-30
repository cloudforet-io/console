import { toString } from 'lodash';
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
