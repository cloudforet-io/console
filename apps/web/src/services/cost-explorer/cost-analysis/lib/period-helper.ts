import dayjs from 'dayjs';

import type { RelativePeriod } from '@/services/cost-explorer/cost-analysis/type';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import type { Granularity, Period } from '@/services/cost-explorer/type';


export const convertRelativePeriodToPeriod = (relativePeriod: RelativePeriod): { start: string; end: string; } => {
    const today = dayjs.utc();
    if (relativePeriod.unit === 'month') {
        return {
            start: today.subtract(relativePeriod.value, 'month').format('YYYY-MM'),
            end: today.subtract(relativePeriod.exclude_today ? 1 : 0, 'month').format('YYYY-MM'),
        };
    } if (relativePeriod.unit === 'year') {
        return {
            start: today.subtract(relativePeriod.value, 'year').format('YYYY'),
            end: today.subtract(relativePeriod.exclude_today ? 1 : 0, 'year').format('YYYY'),
        };
    }
    return {
        start: today.format('YYYY-MM'),
        end: today.format('YYYY-MM'),
    };
};
export const initiatePeriodByGranularity = (granularity?: Granularity): [Period, RelativePeriod|undefined] => {
    if (granularity === GRANULARITY.DAILY) {
        const thisMonthRelativePeriod:RelativePeriod = { unit: 'month', value: 0, exclude_today: true };
        return [convertRelativePeriodToPeriod(thisMonthRelativePeriod), undefined];
    } if (granularity === GRANULARITY.YEARLY) {
        const thisYearRelativePeriod:RelativePeriod = { unit: 'year', value: 0, exclude_today: true };
        return [convertRelativePeriodToPeriod(thisYearRelativePeriod), thisYearRelativePeriod];
    }
    const last6MonthsRelativePeriod:RelativePeriod = { unit: 'month', value: 5, exclude_today: true };
    return [convertRelativePeriodToPeriod(last6MonthsRelativePeriod), last6MonthsRelativePeriod];
};
