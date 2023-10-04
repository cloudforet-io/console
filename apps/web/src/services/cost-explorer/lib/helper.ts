import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import dayjs from 'dayjs';

import type { UsageTypeAdditionalFilter } from '@/services/cost-explorer/lib/config';
import { GRANULARITY, USAGE_TYPE_ADDITIONAL_FILTER_MAP } from '@/services/cost-explorer/lib/config';
import type {
    Period, Granularity,
} from '@/services/cost-explorer/type';


export const getTimeUnitByGranularity = (granularity: Granularity): TimeUnit => {
    if (granularity === GRANULARITY.YEARLY) return 'year';
    if (granularity === GRANULARITY.MONTHLY) return 'month';
    return 'day';
};
export const getPeriodByGranularity = (granularity: Granularity, period: Period): Period => {
    if (granularity === GRANULARITY.DAILY) {
        return {
            start: dayjs.utc(period.start).startOf('month').format('YYYY-MM-DD'),
            end: dayjs.utc(period.end).endOf('month').format('YYYY-MM-DD'),
        };
    }
    return period;
};

/* data table field */
export const getDataTableDateFields = (granularity: Granularity, period: Period, specificFilter?:UsageTypeAdditionalFilter): DataTableFieldType[] => {
    const dateFields: DataTableFieldType[] = [];

    const timeUnit = getTimeUnitByGranularity(granularity);
    const _period = getPeriodByGranularity(granularity, period);

    let labelDateFormat = 'M/D';
    if (timeUnit === 'month') {
        labelDateFormat = 'MMM';
    } else if (timeUnit === 'year') {
        labelDateFormat = 'YYYY';
    }

    const today = dayjs.utc();
    let now = dayjs.utc(_period.start);
    let index = 0;
    const itemName = specificFilter === USAGE_TYPE_ADDITIONAL_FILTER_MAP.cost ? 'cost_sum' : 'usage_quantity_sum';
    while (now.isSameOrBefore(dayjs.utc(_period.end), timeUnit)) {
        if (now.isAfter(today, timeUnit)) break;
        dateFields.push({
            name: `${itemName}.${index}.value`,
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
            name: 'totalCost', label: ' ',
        });
    }
    const dateFields = getDataTableDateFields(granularity, period, USAGE_TYPE_ADDITIONAL_FILTER_MAP.cost);
    return costFields.concat(dateFields);
};
