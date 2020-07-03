import moment, { Moment } from 'moment';
import _ from 'lodash';
import { DateTime } from 'luxon';
import styles from '@/styles/colors';
import { ColorBindFactory } from '@/lib/view-helper';
import { getCurrentInstance } from '@vue/composition-api';

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


export const collectorStateColor = Object.freeze({
    ENABLED: {
        iconColor: styles.safe,
        textColor: styles.gray[900],
    },
    DISABLED: {
        iconColor: styles.alert,
        textColor: styles.alert,
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

// export const cdgStateColor = Object.freeze({
//     ENABLED: {
//         iconColor: styles.safe,
//         textColor: styles.gray[900],
//     },
//     DISABLED: {
//         iconColor: styles.alert,
//         textColor: styles.alert,
//     },
// });

export const platformBadgeColor = Object.freeze({
    BAREMETAL: { backgroundColor: styles.gray[900] },
    HYPERVISOR: { backgroundColor: styles.primary },
    VM: { backgroundColor: styles.secondary1 },
    UNKNOWN: { backgroundColor: styles.gray },
    AWS: { backgroundColor: styles.yellow.default },
    AZURE: { backgroundColor: styles.secondary },
    GCP: { backgroundColor: styles.safe },
    OPENSTACK: { backgroundColor: styles.alert },
    VMWARE: { backgroundColor: styles.green[600] },
    KVM: { backgroundColor: styles.gray[900] },
    XENSERVER: { backgroundColor: styles.gray[900] },
    LINUX: { backgroundColor: styles.coral.default },
    WINDOWS: { backgroundColor: styles.secondary },
});
export const getTimezone = () => {
    const timezone = localStorage.getItem('user/timezone');
    return timezone ? JSON.parse(timezone).data || 'UTC' : 'UTC';
};
export const getLocalDatetimeFromTimeStamp = ts => DateTime.fromSeconds(Number(ts)).setZone(getTimezone()).toFormat('yyyy-LL-dd HH:mm:ss'); // 'yyyy-LL-dd HH:mm:ss ZZZZ' for display Timezone
export const getTimestamp = (momentTime: Moment) => ({
    seconds: `${momentTime.unix()}`,
    nanos: 0,
});

// formatter
export const timestampFormatter = value => getLocalDatetimeFromTimeStamp(value.seconds);
export const chartTimestampFormatter = value => moment.tz(moment.unix(value.seconds), getTimezone()).format('M/DD[\n]HH:mm');

export const serverStateFormatter = ColorBindFactory(serverStateColor, value => value.toLowerCase());
export const userStateFormatter = ColorBindFactory(userStateColor, value => value.toLowerCase());

export const platformBadgeFormatter = (value) => {
    // eslint-disable-next-line no-prototype-builtins
    if (platformBadgeColor.hasOwnProperty(value)) {
        return platformBadgeColor[value];
    }
    return {};
};
export const arrayFormatter = value => ((value && Array.isArray(value) && value.length > 0) ? value.join(', ') : '');
// from @/lib/global-util.js
export const collectorStateFormatter = ColorBindFactory(collectorStateColor, value => value.toLowerCase());

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


// export const isSelectedType = (d, t) => {
//     if (t.toUpperCase() === 'N') {
//         // eslint-disable-next-line no-restricted-globals
//         return (Number.isInteger(d) && !isNaN(d));
//     } if (t.toUpperCase() === 'D' || t.toUpperCase() === 'F') {
//         // eslint-disable-next-line no-restricted-globals
//         return (!isNaN(parseFloat(d)));
//     } if (t.toUpperCase() === 'B') {
//         return ['1', '0', 1, 0, true, false].includes(d);
//     } if (t.toUpperCase() === 'LIST') {
//         const splitString = d.split(',');
//         return !splitString.includes('');
//     } if (t.toUpperCase() === 'S' || t.toUpperCase() === 'STR') {
//         return (typeof d === 'string' || d instanceof String);
//     } if (t.toUpperCase() === 'O') {
//         return (typeof d === 'object' && d !== null && !Array.isArray(d));
//     } if (t.toUpperCase() === 'A') {
//         return Array.isArray(d);
//     }
//     throw new Error('Please, Check data type');
// };

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

export const copyAnyData = (value) => {
    if (Array.isArray(value)) {
        selectToCopyToClipboard(_.toString(value));
    } else if (typeof value === 'object') {
        selectToCopyToClipboard(JSON.stringify(value));
    } else selectToCopyToClipboard(value || '');
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
export const showErrorMessage = (errorTitle, error, root) => {
    const vm = getCurrentInstance();
    const vmRoot = root || vm;
    const errorMsg = error.response.data.error.message;
    if (vmRoot) {
        vmRoot.$notify({
            group: 'noticeTopRight',
            type: 'alert',
            title: errorTitle,
            text: errorMsg,
            duration: 2000,
            speed: 1000,
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
