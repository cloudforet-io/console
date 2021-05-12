import { isEmpty, some } from 'lodash';
import { DateTime } from 'luxon';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import config from '@/lib/config';

dayjs.extend(tz);


// formatter
export const timestampFormatter = (value, timezone) => {
    if (value && value.seconds) return DateTime.fromSeconds(Number(value.seconds)).setZone(timezone).toFormat('yyyy-LL-dd HH:mm:ss');
    return '';
};
export const iso8601Formatter = (time: string, timezone: string) => {
    if (time) return dayjs.tz(dayjs(time), timezone).format('YYYY-MM-DD HH:mm:ss');
    return '';
};
export const numberFormatter = (num) => {
    if (Math.abs(num) < 10000) {
        return Math.round(num * 100) / 100;
    }
    const options = { notation: 'compact', signDisplay: 'auto', maximumFractionDigits: 1 };
    return Intl.NumberFormat('en', options).format(num);
};
export const commaFormatter = (num) => {
    if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return num;
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

/** * @function
 *   @name showErrorMessage
 *   @param error
 *   @param root
 *   @returns
 */
export const showErrorMessage = (errorTitle, error, root) => {
    let errorMsg = '';
    if (error.message) errorMsg = error.message;
    else if (error.response) { errorMsg = error.response.data.error.message; } else { errorMsg = error; }
    if (root) {
        root.$notify({
            group: 'toastTopCenter',
            type: 'alert',
            title: errorTitle,
            text: errorMsg,
            duration: 5000,
            speed: 1000,
        });
    }
};
/** * @function
 *   @name showSuccessMessage
 *   @param successTitle
 *   @param successMessage
 *   @param root
 *   @returns
 */
export const showSuccessMessage = (successTitle, successMessage, root) => {
    if (root) {
        root.$notify({
            group: 'toastTopCenter',
            type: 'success',
            title: successTitle,
            text: successMessage,
            duration: 5000,
            speed: 500,
        });
    }
};

export const showLoadingMessage = (loadingTitle, loadingMessage, root) => {
    if (root) {
        root.$notify({
            group: 'toastTopCenter',
            type: 'loading',
            title: loadingTitle,
            text: loadingMessage,
            duration: -1,
            speed: 500,
        });
    }
};

export const hideLoadingMessage = (root) => {
    if (root) {
        root.$notify({
            group: 'toastTopCenter',
            clean: true,
        });
    }
};


export const downloadURI = (uri: string, name?: string): void => {
    const link = document.createElement('a');

    if (name) {
        link.download = name;
    }

    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const tagsToObject = (tags: Array<{ key: string; value: string }>): Record<string, string> => {
    const tagsObject = {};
    tags.forEach((tag) => {
        tagsObject[tag.key] = tag.value;
    });
    return tagsObject;
};

/**
 * @function
 * @name assetUrlConverter
 * @param src
 * @description Replace assets base url by config
 */
export const assetUrlConverter = (src: string) => {
    const endpoints = config.get('ASSET_PATH');
    if (isEmpty(endpoints) || !src) return src;

    let url = src;
    some(endpoints, (dest, origin) => {
        if (src.startsWith(origin)) url = src.replace(origin, dest);
        return src.startsWith(origin);
    });
    return url;
};
