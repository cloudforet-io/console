import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import dayjs from 'dayjs';

import type { UsageTypeAdditionalFilter } from '@/services/cost-explorer/lib/config';
import { USAGE_TYPE_ADDITIONAL_FILTER_MAP } from '@/services/cost-explorer/lib/config';
import { getPeriodByGranularity, getTimeUnitByGranularity } from '@/services/cost-explorer/lib/helper';
import type {
    Period, Granularity,
} from '@/services/cost-explorer/type';

// eslint-disable-next-line max-len
export const getDataTableCostFields = (granularity: Granularity, period: Period, hasGroupBy: boolean, additionalFilter: UsageTypeAdditionalFilter = USAGE_TYPE_ADDITIONAL_FILTER_MAP.cost): DataTableFieldType[] => {
    const costFields: DataTableFieldType[] = [];
    if (!hasGroupBy) {
        costFields.push({
            name: 'totalCost', label: ' ',
        });
    }
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
    const itemName = additionalFilter === USAGE_TYPE_ADDITIONAL_FILTER_MAP.cost ? 'cost_sum' : 'usage_quantity_sum';
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
    return costFields.concat(dateFields);
};
