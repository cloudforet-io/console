import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';

import {
    computed, getCurrentInstance, Ref
} from '@vue/composition-api';

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

        const duration = () => {
            if (days !== 0) return `${days}d ${hours}h`;
            if (hours !== 0) return `${hours}h ${minutes}m`;
            if (minutes !== 0) return `${minutes}m ${seconds}s`;
            if (seconds !== 0) return `${seconds}s`;
            return '';
        };

        return duration();
    }
    return null;
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

export const tagsToObject = (tags: Array<{ key: string; value: string }>): Record<string, string> => {
    const tagsObject = {};
    tags.forEach((tag) => {
        tagsObject[tag.key] = tag.value;
    });
    return tagsObject;
};

/**
 * make proxy computed that same name as props
 * @param name
 * @param props
 * @param emit
 * @return {Ref<*>}
 */
/* eslint-disable arrow-parens */
export const makeProxy = <T = any>(name: string, props: any = null, emit: any = null): Ref<T> => {
    let _props = props;
    let _emit = emit;
    if (!_props && !_emit) {
        const vm = getCurrentInstance();
        if (vm) {
            _props = vm.$props;
            _emit = vm.$listeners[`update:${name}`];
        } else {
            console.error('unsupported get current instance method');
        }
    }
    return computed({
        get: () => _props[name],
        set: val => {
            if (emit) {
                emit(`update:${name}`, val);
            } else {
                _emit(val);
            }
        }
    });
};
