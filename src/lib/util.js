import { Util } from '@/lib/global-util';

export const timestampFormatter = value => Util.methods.getDatefromTimeStamp(value.seconds, localStorage.getItem('timezone'));

// from @/lib/global-util.js

/** @function
 * @name isEmpty
 * @description  Check whether given value is empty.
 * @param {*} value
 * @return {boolean}
 * */
export const isEmpty = value => !!((value === '' || value === null || value === undefined || (value !== null && typeof value === 'object' && !Object.keys(value).length)));

/** @function
 * @name selectToCopyToClipboard
 * @description copy given text to clipboard
 * @param {String} text
 * */
export const selectToCopyToClipboard = (t) => {
    const textArea = document.createElement('textarea');
    textArea.value = t;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('Copy');
    textArea.remove();
};
