import moment, { Moment } from 'moment';
import _ from 'lodash';
import { DateTime } from 'luxon';
import styles from '@/styles/colors';
import { ColorBindFactory } from '@/lib/view-helper';
import { getCurrentInstance } from '@vue/composition-api';
import { store } from '@/store';

// color set
/**
 * @type {ReadonlyArray<*>}
 * @name colorset
 * @description default color order
 */
export const colorset = Object.freeze([
    styles.primary,
    styles.primary2,
    styles.coral.default,
    styles.secondary,
    styles.secondary1,
    styles.safe,
    styles.green[600],
    styles.green[400],
    styles.yellow.default,
    styles.primary1,
]);

export const serverStateColor = Object.freeze({
    INSERVICE: {
        iconColor: styles.safe,
        textColor: styles.gray[900],
    },
    PENDING: {
        iconColor: styles.coral.default,
        textColor: styles.gray[900],
    },
    MAINTENANCE: {
        iconColor: styles.yellow.default,
        textColor: styles.gray[900],
    },
    CLOSED: {
        iconColor: styles.alert,
        textColor: styles.alert,
    },
    DELETED: {
        iconColor: styles.gray,
        textColor: styles.gray,
    },
});

export const userStateColor = Object.freeze({
    ENABLED: {
        iconColor: styles.safe,
        textColor: styles.gray[900],
    },
    DISABLED: {
        iconColor: styles.alert,
        textColor: styles.alert,
    },
    UNIDENTIFIED: {
        iconColor: styles.gray[500],
        textColor: styles.gray[500],
    },
});

export const getTimezone = () => store.state.user.timezone || 'UTC';
export const getLocalDatetimeFromTimeStamp = ts => DateTime.fromSeconds(Number(ts)).setZone(getTimezone()).toFormat('yyyy-LL-dd HH:mm:ss'); // 'yyyy-LL-dd HH:mm:ss ZZZZ' for display Timezone
export const getTimestamp = (momentTime: Moment) => ({
    seconds: `${momentTime.unix()}`,
    nanos: 0,
});

// formatter
export const timestampFormatter = (value) => {
    if (value && value.seconds) return getLocalDatetimeFromTimeStamp(value.seconds);
    return '';
};
export const iso8601Formatter = (time?: string, timezone?: string) => {
    if (time) return moment.tz(moment(time), timezone || getTimezone()).format('YYYY-MM-DD HH:mm:ss');
    return '';
};

export const serverStateFormatter = ColorBindFactory(serverStateColor, value => value.toLowerCase());
export const userStateFormatter = ColorBindFactory(userStateColor, value => value.toLowerCase());

export const arrayFormatter = value => ((value && Array.isArray(value) && value.length > 0) ? value.join(', ') : '');

// filters
export const getValue = (scope, paths, defaultValue) => {
    let value = scope;
    try {
        for (let i = 0; i < paths.length; i++) {
            value = value[paths[i]];
        }
    } catch (e) {
        return defaultValue || '';
    }
    return value;
};


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
        copyTextToClipboard(_.toString(value));
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

/** * @function
 *   @name showErrorMessage
 *   @param error
 *   @param root
 *   @returns
 */
export const showErrorMessage = (errorTitle, error, root?) => {
    const vm = getCurrentInstance();
    const vmRoot = root || vm;
    let errorMsg = '';
    if (error.response) { errorMsg = error.response.data.error.message; } else { errorMsg = error; }
    if (vmRoot) {
        vmRoot.$notify({
            group: 'toastTopCenter',
            type: 'alert',
            title: errorTitle,
            text: errorMsg,
            duration: 2000,
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
    const vm = getCurrentInstance();
    const vmRoot = root || vm;
    if (vmRoot) {
        vmRoot.$notify({
            group: 'toastTopCenter',
            type: 'success',
            title: successTitle,
            text: successMessage,
            duration: 2000,
            speed: 500,
        });
    }
};


/**
 * @class
 * @name MenuItem
 * @param name
 * @param label
 * @return {Object}
 */
export class MenuItem {
    name: string;

    label: string;

    type: string;

    constructor(name, label) {
        this.name = name;
        this.label = label || name;
        this.type = 'item';
    }
}

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
