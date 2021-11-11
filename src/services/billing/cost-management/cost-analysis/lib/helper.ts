import dayjs, { Dayjs } from 'dayjs';
import { GRANULARITY } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { TimeUnit } from '@amcharts/amcharts4/core';


export const getConvertedGranularity = (selectedDates: string[], granularity: GRANULARITY): GRANULARITY => {
    const start = dayjs(selectedDates[0]);
    const end = dayjs(selectedDates[1]);

    if (granularity !== GRANULARITY.ACCUMULATED) return granularity;
    if (end.diff(start, 'month') < 2) return GRANULARITY.DAILY;
    if (end.diff(start, 'year') < 2) return GRANULARITY.MONTHLY;
    return GRANULARITY.YEARLY;
};

export const getTimeUnit = (granularity: GRANULARITY, start: Dayjs, end: Dayjs): TimeUnit => {
    if (granularity !== GRANULARITY.ACCUMULATED) {
        if (granularity === GRANULARITY.DAILY) return 'day';
        if (granularity === GRANULARITY.MONTHLY) return 'month';
        return 'year';
    }
    if (end.diff(start, 'month') < 2) return 'day';
    if (end.diff(start, 'year') < 2) return 'month';
    return 'year';
};

export const getInitialDates = (): string[] => {
    const start = dayjs.utc().startOf('month').format();
    const end = dayjs.utc().startOf('date').format();
    return [start, end];
};
