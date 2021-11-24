import dayjs, { Dayjs } from 'dayjs';
import { CHART_TYPE } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { TimeUnit } from '@amcharts/amcharts4/core';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { FilterItem, Period } from '@/services/billing/cost-management/cost-analysis/store/type';
import { FILTER_ITEM, GRANULARITY } from '@/services/billing/cost-management/lib/config';


export const getConvertedGranularity = (period: Period, granularity: GRANULARITY): GRANULARITY => {
    const start = dayjs(period.start);
    const end = dayjs(period.end);

    if (granularity !== GRANULARITY.ACCUMULATED) return granularity;
    if (end.diff(start, 'month') < 2) return GRANULARITY.DAILY;
    if (end.diff(start, 'year') < 2) return GRANULARITY.MONTHLY;
    return GRANULARITY.YEARLY;
};

export const getConvertedFilter = (filters: Record<FILTER_ITEM, FilterItem[]>): QueryStoreFilter[] => {
    const result: QueryStoreFilter[] = [];
    Object.entries(filters).forEach(([filterName, filterItems]) => {
        if (filterItems?.length) {
            const filterValues = filterItems.map(d => d.name);
            result.push({
                k: filterName,
                v: filterValues,
                o: '=',
            });
        }
    });
    return result;
};

export const getConvertedPeriod = (granularity: GRANULARITY, chartType: CHART_TYPE, period: Period): Period => {
    let start = period.start;
    if (chartType === CHART_TYPE.DONUT && granularity !== GRANULARITY.ACCUMULATED) {
        if (granularity === GRANULARITY.DAILY) {
            start = period.end;
        } else if (granularity === GRANULARITY.MONTHLY) {
            start = dayjs.utc(period.end).startOf('month').format();
        } else {
            start = dayjs.utc(period.end).startOf('year').format();
        }
    }
    const end = dayjs.utc(period.end).add(1, 'day').format();
    return { start, end };
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

export const getInitialDates = (): Period => {
    const start = dayjs.utc().startOf('month').format();
    const end = dayjs.utc().startOf('date').format();
    return { start, end };
};
