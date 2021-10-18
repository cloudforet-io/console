import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

export const initDayjs = () => {
    dayjs.extend(utc);
    dayjs.extend(tz);
    dayjs.extend(relativeTime, {
        thresholds: [
            { l: 'd', r: 1, d: 'day' },
            { l: 'dd', r: 29, d: 'day' },
            { l: 'M', r: 1, d: 'month' },
            { l: 'MM', r: 11, d: 'month' },
            { l: 'y', d: 'year' },
            { l: 'yy', d: 'year' },
        ],
        rounding: Math.ceil, // Any time before midnight is considered as the previous date.
    });
    dayjs.extend(isSameOrBefore);
    dayjs.extend(isSameOrAfter);
};
