import { Util } from '@/lib/global-util';
import styles from '@/styles/_variables.scss';
import { ColorBindFactory } from '@/lib/view-helper';

// color set
/**
 * @type {ReadonlyArray<*>}
 * @name colorset
 * @description default color order
 */
export const colorset = Object.freeze([
    styles.primary,
    styles.primary2,
    styles.other1,
    styles.secondary,
    styles.secondary1,
    styles.safe,
    styles.other4,
    styles.other3,
    styles.other2,
    styles.primary1,
]);

export const serverStateColor = Object.freeze({
    INSERVICE: {
        iconColor: styles.safe,
        textColor: styles.dark,
    },
    PENDING: {
        iconColor: styles.other1,
        textColor: styles.dark,
    },
    MAINTENANCE: {
        iconColor: styles.other2,
        textColor: styles.dark,
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
        textColor: styles.dark,
    },
    DISABLED: {
        iconColor: styles.alert,
        textColor: styles.alert,
    },
});

export const userStateColor = Object.freeze({
    ENABLED: {
        iconColor: styles.safe,
        textColor: styles.dark,
    },
    DISABLED: {
        iconColor: styles.alert,
        textColor: styles.alert,
    },
});

export const cdgStateColor = Object.freeze({
    ENABLED: {
        iconColor: styles.safe,
        textColor: styles.dark,
    },
    DISABLED: {
        iconColor: styles.alert,
        textColor: styles.alert,
    },
});

export const platformBadgeColor = Object.freeze({
    BAREMETAL: { backgroundColor: styles.dark },
    HYPERVISOR: { backgroundColor: styles.primary },
    VM: { backgroundColor: styles.secondary1 },
    UNKNOWN: { backgroundColor: styles.gray },
    AWS: { backgroundColor: styles.other2 },
    AZURE: { backgroundColor: styles.secondary },
    GCP: { backgroundColor: styles.safe },
    OPENSTACK: { backgroundColor: styles.alert },
    VMWARE: { backgroundColor: styles.other4 },
    KVM: { backgroundColor: styles.dark },
    XENSERVER: { backgroundColor: styles.dark },
    LINUX: { backgroundColor: styles.other1 },
    WINDOWS: { backgroundColor: styles.secondary },
});


// formatter
export const timestampFormatter = value => Util.methods.getDatefromTimeStamp(value.seconds, localStorage.getItem('timezone'));

export const serverStateFormatter = ColorBindFactory(serverStateColor, value => value.toLowerCase());
export const userStateFormatter = ColorBindFactory(userStateColor, value => value.toLowerCase());

export const platformBadgeFormatter = (value) => {
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


export const isSelectedType = (d, t) => {
    if (t.toUpperCase() === 'N') {
        return (Number.isInteger(d) && !isNaN(d));
    } if (t.toUpperCase() === 'D' || t.toUpperCase() === 'F') {
        return (!isNaN(parseFloat(d)));
    } if (t.toUpperCase() === 'B') {
        return ['1', '0', 1, 0, true, false].includes(d);
    } if (t.toUpperCase() === 'LIST') {
        const splitString = d.split(',');
        return !splitString.includes('');
    } if (t.toUpperCase() === 'S' || t.toUpperCase() === 'STR') {
        return (typeof d === 'string' || d instanceof String);
    } if (t.toUpperCase() === 'O') {
        return (typeof d === 'object' && d !== null && !Array.isArray(d));
    } if (t.toUpperCase() === 'A') {
        return Array.isArray(d);
    }
    throw 'Please, Check data type';
};

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
