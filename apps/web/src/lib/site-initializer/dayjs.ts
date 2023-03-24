import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import relativeTime from 'dayjs/plugin/relativeTime';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

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
