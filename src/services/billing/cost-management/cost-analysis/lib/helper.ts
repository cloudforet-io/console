import dayjs, { Dayjs } from 'dayjs';
import {
    CHART_TYPE, FILTER_ITEM, FilterItem, GRANULARITY,
} from '@/services/billing/cost-management/cost-analysis/lib/config';
import { TimeUnit } from '@amcharts/amcharts4/core';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { ChartData } from '@/common/composables/dynamic-chart/type';


export const getConvertedGranularity = (selectedDates: string[], granularity: GRANULARITY): GRANULARITY => {
    const start = dayjs(selectedDates[0]);
    const end = dayjs(selectedDates[1]);

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
                o: '',
            });
        }
    });
    return result;
};

export const getConvertedSelectedDates = (granularity: GRANULARITY, chartType: CHART_TYPE, selectedDates: string[]): string[] => {
    let start = selectedDates[0];
    if (chartType === CHART_TYPE.DONUT && granularity !== GRANULARITY.ACCUMULATED) {
        if (granularity === GRANULARITY.DAILY) {
            start = selectedDates[1];
        } else if (granularity === GRANULARITY.MONTHLY) {
            start = dayjs.utc(selectedDates[1]).startOf('month').format();
        } else {
            start = dayjs.utc(selectedDates[1]).startOf('year').format();
        }
    }
    const end = dayjs.utc(selectedDates[1]).add(1, 'day').format();
    return [start, end];
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

export const mergePrevChartDataAndCurrChartData = (prevData: ChartData, currData?: ChartData): ChartData => {
    const mergedData: Record<string, number> = {};
    Object.keys({ ...prevData, ...currData }).forEach((k) => {
        const prevValue = prevData[k] || 0;
        if (k !== 'date') {
            if (currData && currData[k]) {
                mergedData[k] = currData[k] + prevValue;
            } else {
                mergedData[k] = prevValue;
            }
        }
    });
    return mergedData;
};
