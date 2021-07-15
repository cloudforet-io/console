import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

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


export const dayjsLocales: Record<string, () => Promise<any>> = {
    en: () => import('dayjs/locale/en'),
    ko: () => import('dayjs/locale/ko'),
    ja: () => import('dayjs/locale/ja'),
};
export const dayjsLanguageMap: Record<string, any> = {};
export const supportedLocales = Object.keys(dayjsLocales);
