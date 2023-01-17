import bytes from 'bytes';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { isEmpty, flatten } from 'lodash';
import { DateTime } from 'luxon';

dayjs.extend(tz);
dayjs.extend(utc);

// formatter
export const timestampFormatter = (value, timezone) => {
    if (value && value.seconds) return DateTime.fromSeconds(Number(value.seconds)).setZone(timezone).toFormat('yyyy-LL-dd HH:mm:ss');
    return '';
};
export const iso8601Formatter = (time: string, timezone: string, format = 'YYYY-MM-DD HH:mm:ss') => {
    if (time) return dayjs.tz(dayjs(time), timezone).format(format);
    return '';
};
export const durationFormatter = (createdAt: string, finishedAt: string, timezone: string) => {
    if (createdAt && finishedAt) {
        const createdAtTime = dayjs(iso8601Formatter(createdAt, timezone));
        const finishedAtTime = dayjs(iso8601Formatter(finishedAt, timezone));
        const timeDiff = dayjs(finishedAtTime).diff(createdAtTime, 'second');
        const days = Math.floor(timeDiff / 86400);
        const hours = Math.floor((timeDiff % 86400) / 3600);
        const minutes = Math.floor((timeDiff % 3600) / 60);
        const seconds = Math.floor((timeDiff % 60) % 60);

        if (timeDiff < 0) return 'now';
        if (days !== 0) return `${days}d ${hours}h`;
        if (hours !== 0) return ` ${hours}h ${minutes}m`;
        if (minutes !== 0) return `${minutes}m ${seconds}s`;
        if (seconds !== 0) return `${seconds}s`;
    }
    return null;
};

export const numberFormatter = (num, digits = 1) => {
    if (Math.abs(num) < 10000) {
        return Math.round(num * 100) / 100;
    }

    return Intl.NumberFormat('en', { notation: 'compact', signDisplay: 'auto', maximumFractionDigits: digits }).format(num);
};
export const commaFormatter = (num) => {
    if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return num;
};
export const byteFormatter = (num, option = {}) => bytes(num, { ...option, unitSeparator: ' ', decimalPlaces: 1 });

/**
 * @param value
 * @description get number or undefined from string.
 * @example
 * getNumberFromString('1,000,000') => 1000000
 * getNumberFromString('$1,000,000') => 1000000
 */
export const getNumberFromString = (value: string): number|undefined => {
    const str = value.match(/\d+/g)?.join('');
    return str ? parseFloat(str) : undefined;
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

export const tagsToObject = (tags: Array<{ key: string; value: string }>): Record<string, string> => {
    const tagsObject = {};
    tags.forEach((tag) => {
        tagsObject[tag.key] = tag.value;
    });
    return tagsObject;
};


const getObjectValue = (target: Record<string, any>|Array<any>, currentPath: string) => {
    if (Array.isArray(target)) {
        if (Number.isNaN(Number(currentPath))) {
            return flatten(target.map((d) => {
                if (typeof d === 'object') return getObjectValue(d, currentPath);
                return d;
            }));
        }
        return target[Number(currentPath)];
    }
    return target[currentPath];
};

export const getValueByPath = (data: any, path: string|null) => {
    if (typeof path !== 'string') return data;

    let target = data;
    const pathArr = path.split('.');

    for (let i = 0; i < pathArr.length; i++) {
        if (target === undefined || target === null || typeof target !== 'object') return target;

        const currentPath = pathArr[i];

        if (typeof target === 'object') {
            target = getObjectValue(target, currentPath);
        }
    }
    return target;
};

