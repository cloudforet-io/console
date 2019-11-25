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
