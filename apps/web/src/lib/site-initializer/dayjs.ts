import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import relativeTime from 'dayjs/plugin/relativeTime';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

export const initDayjs = () => {
    dayjs.extend(utc);
    dayjs.extend(tz);
    dayjs.extend(duration);
    dayjs.extend(relativeTime, {
        thresholds: [
            { l: 's', r: 1 },
            { l: 'm', r: 1 },
            { l: 'mm', r: 59, d: 'minute' },
            { l: 'd', r: 1 },
            { l: 'dd', r: 29, d: 'day' },
            { l: 'h', r: 1 },
            { l: 'hh', r: 23, d: 'hour' },
            { l: 'M', r: 1 },
            { l: 'MM', r: 11, d: 'month' },
            { l: 'y' },
            { l: 'yy', d: 'year' },
        ],
        // rounding: Math.ceil, // Any time before midnight is considered as the previous date.
    });
    dayjs.extend(isSameOrBefore);
    dayjs.extend(isSameOrAfter);
};
