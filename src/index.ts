import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';

dayjs.extend(tz);

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
    const options = { notation: 'compact', signDisplay: 'auto', maximumFractionDigits: digits };
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

export const tagsToObject = (tags: Array<{ key: string; value: string }>): Record<string, string> => {
    const tagsObject = {};
    tags.forEach((tag) => {
        tagsObject[tag.key] = tag.value;
    });
    return tagsObject;
};
