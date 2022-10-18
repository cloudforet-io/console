import type { TimeUnit } from '@amcharts/amcharts4/core';
import type { DataTableFieldType } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import type { QueryStoreFilter } from '@cloudforet/core-lib/query/type';

import { FILTER, GRANULARITY } from '@/services/cost-explorer/lib/config';
import type {
    Period, Granularity, CostQueryFilterItem, RefinedFilterItem, Filter,
} from '@/services/cost-explorer/type';


export const convertFilterItemToQueryStoreFilter = (filters: CostQueryFilterItem[]): QueryStoreFilter[] => {
    const results: QueryStoreFilter[] = [];
    const categories: Filter[] = [...new Set(filters.map(d => d.category))];
    categories.forEach((category) => {
        const filterItems = filters.filter(d => d.category === category);
        const filterKey = filterItems.length ? filterItems[0]?.key : undefined;
        results.push({
            k: filterKey ? `${category}.${filterKey}` : category,
            v: filterItems.map(d => d.value),
            o: '=',
        });
    });
    return results;
};

export const getRefinedFilterItems = (resourceMap: Record<string, any>, filterItems: CostQueryFilterItem[]): RefinedFilterItem[] => {
    const results: RefinedFilterItem[] = [];
    filterItems.forEach((f) => {
        const resourceItem = resourceMap[f.category]?.[f.value];
        let label = f.value;
        if (resourceItem) {
            label = f.category === FILTER.REGION ? resourceItem?.name : resourceItem?.label;
        }
        results.push({
            ...f,
            label,
        });
    });
    return results;
};

export const getConvertedBudgetFilter = (filters: CostQueryFilterItem[]): QueryStoreFilter[] => {
    const result: QueryStoreFilter[] = [];

    const PROJECT_CATEGORIES: Filter[] = [FILTER.PROJECT, FILTER.PROJECT_GROUP];
    const projectFilterItems = filters.filter(d => PROJECT_CATEGORIES.includes(d.category));
    projectFilterItems.forEach((d) => {
        result.push({ k: d.category, v: d.value, o: '=' });
    });

    const extraCategories: Filter[] = [...new Set(filters.filter(d => !PROJECT_CATEGORIES.includes(d.category)).map(d => d.category))];
    extraCategories.forEach((category) => {
        const filterItems = filters.filter(d => d.category === category);
        const filterKey = filterItems.length ? filterItems[0]?.key : undefined;
        const k = filterKey ? `${category}.${filterKey}` : category;
        const values = filterItems.map(d => d.value);
        result.push({
            k: `cost_types.${k}`,
            v: [null, ...values],
            o: '=',
        });
    });
    return result;
};

export const getTimeUnitByPeriod = (granularity: Granularity, start: Dayjs, end: Dayjs): TimeUnit => {
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
    const end = dayjs.utc().endOf('month').format();
    return { start, end };
};

/* data table field */
const getDataTableDateFields = (granularity: Granularity, period: Period): DataTableFieldType[] => {
    const dateFields: DataTableFieldType[] = [];
    const start = dayjs.utc(period.start);
    const end = dayjs.utc(period.end);

    const timeUnit = getTimeUnitByPeriod(granularity, dayjs.utc(period.start), dayjs.utc(period.end));
    let dateFormat = 'YYYY-MM-DD';
    if (granularity === GRANULARITY.MONTHLY) dateFormat = 'YYYY-MM';
    if (granularity === GRANULARITY.YEARLY) dateFormat = 'YYYY';

    const nameDateFormat = dateFormat;
    let labelDateFormat = 'M/D';
    if (timeUnit === 'month') {
        labelDateFormat = 'MMM';
    } else if (timeUnit === 'year') {
        labelDateFormat = 'YYYY';
    }

    let now = start;
    while (now.isSameOrBefore(end, timeUnit)) {
        dateFields.push({
            name: `usd_cost.${now.format(nameDateFormat)}`,
            label: now.locale('en').format(labelDateFormat),
            textAlign: 'right',
            sortable: true,
        });
        now = now.add(1, timeUnit);
    }
    return dateFields;
};
export const getDataTableCostFields = (granularity: Granularity, period: Period, hasGroupBy: boolean): DataTableFieldType[] => {
    const costFields: DataTableFieldType[] = [];

    if (granularity === GRANULARITY.ACCUMULATED) {
        const label = `${dayjs.utc(period.start).format('M/D')}~${dayjs.utc(period.end).format('M/D')}`;
        if (!hasGroupBy) {
            costFields.push({
                name: 'totalCost', label: ' ',
            });
        }
        costFields.push({
            name: 'usd_cost', label, textAlign: 'right',
        });
        return costFields;
    }

    if (!hasGroupBy) {
        costFields.push({
            name: 'totalCost', label: ' ', textAlign: 'right',
        });
    }
    const dateFields = getDataTableDateFields(granularity, period);
    return costFields.concat(dateFields);
};
