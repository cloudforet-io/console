import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import dayjs from 'dayjs';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import type {
    Period, Granularity,
} from '@/services/cost-explorer/type';


export const getTimeUnitByGranularity = (granularity: Granularity): TimeUnit => {
    if (granularity === GRANULARITY.YEARLY) return 'year';
    if (granularity === GRANULARITY.MONTHLY) return 'month';
    return 'day';
};

/* data table field */
const getDataTableDateFields = (granularity: Granularity, period: Period): DataTableFieldType[] => {
    const dateFields: DataTableFieldType[] = [];
    const start = dayjs.utc(period.start);
    const end = dayjs.utc(period.end);

    const timeUnit = getTimeUnitByGranularity(granularity);

    let labelDateFormat = 'M/D';
    if (timeUnit === 'month') {
        labelDateFormat = 'MMM';
    } else if (timeUnit === 'year') {
        labelDateFormat = 'YYYY';
    }

    let now = start;
    let index = 0;
    while (now.isSameOrBefore(end, timeUnit)) {
        dateFields.push({
            name: `cost_sum.${index}.value`,
            label: now.locale('en').format(labelDateFormat),
            textAlign: 'right',
            sortable: true,
        });
        now = now.add(1, timeUnit);
        index += 1;
    }
    return dateFields;
};
export const getDataTableCostFields = (granularity: Granularity, period: Period, hasGroupBy: boolean): DataTableFieldType[] => {
    const costFields: DataTableFieldType[] = [];
    if (!hasGroupBy) {
        costFields.push({
            name: 'totalCost', label: ' ', textAlign: 'right',
        });
    }
    const dateFields = getDataTableDateFields(granularity, period);
    return costFields.concat(dateFields);
};
