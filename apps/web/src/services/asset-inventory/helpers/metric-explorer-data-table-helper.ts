import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import dayjs from 'dayjs';
import { cloneDeep, find, sortBy } from 'lodash';

import { GRANULARITY } from '@/services/asset-inventory/constants/metric-explorer-constant';
import type { Granularity, Period } from '@/services/asset-inventory/types/metric-explorer-type';


export const getMetricExplorerDataTableDateFields = (granularity: Granularity, period: Period, hasGroupBy: boolean): DataTableFieldType[] => {
    const defaultFields: DataTableFieldType[] = [];
    const dateFields: DataTableFieldType[] = [];
    if (!hasGroupBy) {
        defaultFields.push({
            name: 'total', label: ' ',
        });
    }
    let timeUnit: TimeUnit = 'month';
    let labelDateFormat = 'MMM';
    if (granularity === GRANULARITY.DAILY) {
        timeUnit = 'day';
        labelDateFormat = 'M/D';
    }

    const today = dayjs.utc();
    let now = dayjs.utc(period.start);
    let index = 0;
    while (now.isSameOrBefore(dayjs.utc(period.end), timeUnit)) {
        if (now.isAfter(today, timeUnit)) break;
        dateFields.push({
            name: `value_sum.${index}.value`, // TODO: update after API response changed
            label: now.locale('en').format(labelDateFormat),
            textAlign: 'right',
            sortable: true,
        });
        now = now.add(1, timeUnit);
        index += 1;
    }
    return defaultFields.concat(dateFields);
};

export const getRefinedMetricExplorerTableData = (results = [], granularity: Granularity, period: Period) => {
    const timeUnit = granularity === GRANULARITY.MONTHLY ? 'month' : 'day';
    let dateFormat = 'YYYY-MM-DD';
    if (timeUnit === 'month') dateFormat = 'YYYY-MM';

    const _results = cloneDeep(results);
    const refinedTableData = [];
    const today = dayjs.utc();
    _results.forEach((d) => {
        let target = cloneDeep(d.value_sum); // TODO: update after API response changed
        let now = dayjs.utc(period.start).clone();
        while (now.isSameOrBefore(dayjs.utc(period.end), timeUnit)) {
            if (!now.isAfter(today, timeUnit) && !find(target, { date: now.format(dateFormat) })) {
                target?.push({ date: now.format(dateFormat), value: 0 });
            }
            now = now.add(1, timeUnit);
        }
        target = sortBy(target, ['date']);
        refinedTableData.push({
            ...d,
            value_sum: target,
        });
    });
    return refinedTableData;
};
