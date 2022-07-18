import type { TimeUnit } from '@amcharts/amcharts4/core';
import type { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import type { DataTableFieldType } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import type { CostQueryFilters, Period, Granularity } from '@/services/cost-explorer/type';


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
        if ((key === 'project_id' || key === 'project_group_id') && data?.length) {
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
