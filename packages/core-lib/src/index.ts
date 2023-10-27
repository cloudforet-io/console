import bytes from 'bytes';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
    isEmpty, flatten, sortBy, isEqualWith, isEqual, union,
} from 'lodash';

dayjs.extend(tz);
dayjs.extend(utc);

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

/**
 * @name numberFormatter
 * @param value
 * @param options
 * @description For detailed information on the types of options, please refer to the following link.
 * { notation: 'compact' }: 10000 => 10K (default)
 * { notation: 'standard' }: 10000 => 10,000
 * { maximumFractionDigits: 2 }: 0.1234 => 0.12 (default)
 * { maximumFractionDigits: 21 }: 0.14324234234 => 0.14324234234
 * { minimumFractionDigits: 2 }: 0 => 0.00
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
 */
export const numberFormatter = (value?: number, options?: Intl.NumberFormatOptions) => {
    if (typeof value === 'number') {
        let _value = value;
        if (!options?.maximumFractionDigits) {
            _value = Math.ceil(value * 100) / 100;
        }
        return Intl.NumberFormat('en', {
            notation: 'standard',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            ...options,
        }).format(_value);
    }
    return value;
};
export const byteFormatter = (num, option = {}) => bytes(num, { ...option, unitSeparator: ' ', decimalPlaces: 1 });

/**
 * @param value
 * @description get number or undefined from string.
 * @example
 * getNumberFromString('1,000,000') => 1000000
 * getNumberFromString('$1,000,000') => 1000000
 */
export const getNumberFromString = (value?: string): number|undefined => {
    const str = value?.match(/[\d.]+/g)?.join('');
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

export const isObjectEqual = (objValue?: object, othValue?: object) => {
    if (!objValue && !othValue) return true;
    if (!objValue || !othValue) return false;
    const _isEqual = isEqual(objValue, othValue);
    if (_isEqual) return true;
    const keys = union(Object.keys(objValue), Object.keys(othValue));
    return isEqualWith(objValue, othValue, (a, b) => keys.every((key) => {
        if (typeof a[key] === 'object' && typeof b[key] === 'object') {
            return isObjectEqual(a[key], b[key]);
        }
        return isEqual(a[key], b[key]);
    }));
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


/** @function
 * @name getRGBFromHex
 * @param hex
 * @description get rgb array from hex string.
 * @example getRGBFromHex('#000000') => { r: 0, g: 0, b: 0 }
 */
export const getRGBFromHex = (hex: string): { r: number, g: number, b: number } => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return { r, g, b };
};


interface RawData {
    [key: string]: any
}

/** @function
 * @name sortArrayInObjectArray
 * @description Sort array in object array
 * @param rawData raw data to sort
 * @param sortKey key to sort target array
 * @param targetArrayFieldKeys target array field keys
 */
export const sortArrayInObjectArray = <Data extends RawData = RawData>(
    rawData: Data[],
    sortKey: string,
    targetArrayFieldKeys: string[],
): Data[] => rawData.map((d) => {
        const result: any = { ...d };
        targetArrayFieldKeys.forEach((targetArrayFieldKey) => {
            const targetArray = d[targetArrayFieldKey];
            if (!Array.isArray(targetArray)) return;
            result[targetArrayFieldKey] = sortBy(targetArray, sortKey);
        });
        return result;
    });
