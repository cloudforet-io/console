import dayjs from 'dayjs';
import { sortBy } from 'lodash';

import type { AllReferenceTypeInfo, ReferenceType } from '@/store/modules/reference/type';

import { getTimeUnitByPeriod } from '@/services/cost-explorer/lib/helper';
import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import type { Granularity, GroupBy } from '@/services/dashboards/widgets/config';
import type { HistoryDataModel } from '@/services/dashboards/widgets/type';

/**
 * @name getWidgetTableDateFields
 * @description Get refined PDataTable fields.
 * @example [{ name: 'usd_cost_sum.0.value', label: '2022-09' }, ...]
 */
export const getWidgetTableDateFields = (
    granularity: Granularity,
    dateRange: DateRange,
    textOptions: Field['textOptions'],
    fieldsKey = 'usd_cost',
): Field[] => {
    if (!granularity || !dateRange?.end) return [];
    const dateFields: Field[] = [];
    const start = dayjs.utc(dateRange.start);
    const end = dayjs.utc(dateRange.end);

    const timeUnit = getTimeUnitByPeriod(granularity, start, end);
    let labelDateFormat = 'M/D';
    if (timeUnit === 'month') {
        labelDateFormat = 'MMM';
    } else if (timeUnit === 'year') {
        labelDateFormat = 'YYYY';
    }

    let now = start;
    let count = 0;
    while (now.isSameOrBefore(end, timeUnit)) {
        dateFields.push({
            name: `${fieldsKey}_sum.${count}.value`,
            label: now.locale('en').format(labelDateFormat),
            textAlign: 'right',
            textOptions,
        });
        now = now.add(1, timeUnit);
        count += 1;
    }
    return dateFields;
};

export const sortTableDataByDate = (rawData: HistoryDataModel['results']): HistoryDataModel['results'] => {
    const results: HistoryDataModel['results'] = [];
    rawData.forEach((d) => {
        const _usdCostSum = sortBy(d.usd_cost_sum, 'date');
        const _usageQuantitySum = sortBy(d.usage_quantity_sum, 'date');
        results.push({
            ...d,
            usd_cost_sum: _usdCostSum,
            usage_quantity_sum: _usageQuantitySum,
        });
    });
    return results;
};

export const getReferenceTypeOfGroupBy = (allReferenceTypeInfo: AllReferenceTypeInfo, groupBy: GroupBy): ReferenceType | undefined => {
    const referenceTypeInfo = Object.values(allReferenceTypeInfo).find((info) => info.key === groupBy);
    if (referenceTypeInfo) return referenceTypeInfo.type;
    return undefined;
};
