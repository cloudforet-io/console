// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { OpUnitType } from 'dayjs';
import dayjs from 'dayjs';
import { cloneDeep, find, sortBy } from 'lodash';

import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { GRANULARITY } from '@/services/asset-inventory/constants/asset-analysis-constant';
import type {
    Granularity, Period, MetricDataAnalyzeResult,
} from '@/services/asset-inventory/types/asset-analysis-type';


export const getAssetAnalysisDataTableDateFields = (granularity: Granularity, period: Period, hasGroupBy: boolean, realtimeDate?: string): DataTableFieldType[] => {
    const defaultFields: DataTableFieldType[] = [];
    const dateFields: DataTableFieldType[] = [];
    if (!hasGroupBy) {
        defaultFields.push({
            name: 'totalCount', label: ' ',
        });
    }
    let timeUnit: OpUnitType = 'month';
    let labelDateFormat = 'MMM';
    if (granularity === GRANULARITY.DAILY) {
        timeUnit = 'day';
        labelDateFormat = 'M/D';
    }

    if (realtimeDate) {
        const targetDate = dayjs.utc(realtimeDate);
        dateFields.push({
            name: 'count.0.value',
            label: targetDate.locale('en').format(labelDateFormat),
            textAlign: 'right',
            sortable: true,
        });
        return defaultFields.concat(dateFields);
    }

    const today = dayjs.utc();
    let now = dayjs.utc(period.start);
    let index = 0;
    while (now.isSameOrBefore(dayjs.utc(period.end), timeUnit)) {
        if (now.isAfter(today, timeUnit)) break;
        dateFields.push({
            name: `count.${index}.value`,
            label: now.locale('en').format(labelDateFormat),
            textAlign: 'right',
            sortable: true,
        });
        now = now.add(1, timeUnit);
        index += 1;
    }
    return defaultFields.concat(dateFields);
};

export const getRefinedAssetAnalysisTableData = (results: MetricDataAnalyzeResult[] = [], granularity: Granularity, period: Period, realtimeDate?: string): MetricDataAnalyzeResult[] => {
    const timeUnit = granularity === GRANULARITY.MONTHLY ? 'month' : 'day';
    let dateFormat = 'YYYY-MM-DD';
    if (timeUnit === 'month') dateFormat = 'YYYY-MM';

    const _results = cloneDeep(results);
    const refinedTableData: MetricDataAnalyzeResult[] = [];

    if (realtimeDate) {
        _results
            .filter((d) => d.date === realtimeDate)
            .forEach((d) => {
                refinedTableData.push({
                    ...d,
                    count: [
                        {
                            date: realtimeDate,
                            value: d.count,
                        },
                    ],
                });
            });
        return refinedTableData;
    }
    const today = dayjs.utc();
    _results.forEach((d) => {
        let target = cloneDeep(d.count);
        let now = dayjs.utc(period.start).clone();
        while (now.isSameOrBefore(dayjs.utc(period.end), timeUnit)) {
            if (!now.isAfter(today, timeUnit) && !find(target, { date: now.format(dateFormat) })) {
                target?.push({ date: now.format(dateFormat), value: undefined });
            }
            now = now.add(1, timeUnit);
        }
        target = sortBy(target, ['date']);
        refinedTableData.push({
            ...d,
            count: target,
        });
    });
    return refinedTableData;
};
