import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';

import {
    computed, getCurrentInstance, Ref,
} from '@vue/composition-api';

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
export const durationFormatter = (createdAt: string, finishedAt: string, timezone: string) => {
    if (createdAt && finishedAt) {
        const createdAtTime = dayjs(iso8601Formatter(createdAt, timezone));
        const finishedAtTime = dayjs(iso8601Formatter(finishedAt, timezone));
        const durationSec = finishedAtTime.diff(createdAtTime, 'second');
        const durationMin = finishedAtTime.diff(createdAtTime, 'minute');
        const durationHours = finishedAtTime.diff(createdAtTime, 'hour');
        const durationDays = finishedAtTime.diff(createdAtTime, 'day');
        if (durationSec < 60) return `${durationSec}s`;
        if (durationMin < 60) return `${durationMin}m`;
        if (durationHours < 24) return `${durationHours}h ${durationMin % 60}m`;
        return `${durationDays % 24}d ${durationHours % 24}h`;
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
        },
    });
};
