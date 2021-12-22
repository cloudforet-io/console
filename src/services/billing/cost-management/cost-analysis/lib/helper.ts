import dayjs, { Dayjs } from 'dayjs';
import { TimeUnit } from '@amcharts/amcharts4/core';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { CostQueryFilters, Period } from '@/services/billing/cost-management/type';


export const getConvertedGranularity = (period: Period, granularity: GRANULARITY): GRANULARITY => {
    const start = dayjs(period.start);
    const end = dayjs(period.end);

    if (granularity !== GRANULARITY.ACCUMULATED) return granularity;
    if (end.diff(start, 'month') < 2) return GRANULARITY.DAILY;
    if (end.diff(start, 'year') < 2) return GRANULARITY.MONTHLY;
    return GRANULARITY.YEARLY;
};

export const getConvertedFilter = (filters: CostQueryFilters): QueryStoreFilter[] => {
    const result: QueryStoreFilter[] = [];
    Object.entries(filters).forEach(([key, data]) => {
        if (data?.length) {
            result.push({
                k: key,
                v: data,
                o: '=',
            });
        }
    });
    return result;
};

export const getConvertedBudgetFilter = (filters: CostQueryFilters): QueryStoreFilter[] => {
    const result: QueryStoreFilter[] = [];
    Object.entries(filters).forEach(([key, data]) => {
        if (key === 'project_id' && data?.length) {
            result.push({
                k: key,
                v: data,
                o: '=',
            });
        } else {
            const values = [] as Array<string|null>;
            if (data?.length) {
                data.forEach((value) => {
                    values.push(value);
                });
                result.push({
                    k: `cost_types.${key}`,
                    v: [null, ...values],
                    o: '=',
                });
            }
        }
    });
    return result;
};

export const getTimeUnitByPeriod = (granularity: GRANULARITY, start: Dayjs, end: Dayjs): TimeUnit => {
    if (granularity !== GRANULARITY.ACCUMULATED) {
        if (granularity === GRANULARITY.DAILY) return 'day';
        if (granularity === GRANULARITY.MONTHLY) return 'month';
        return 'year';
    }
    if (end.diff(start, 'month') < 2) return 'day';
    if (end.diff(start, 'year') < 2) return 'month';
    return 'year';
};

export const getInitialDates = (): Period => {
    const start = dayjs.utc().startOf('month').format();
    const end = dayjs.utc().startOf('date').format();
    return { start, end };
};
