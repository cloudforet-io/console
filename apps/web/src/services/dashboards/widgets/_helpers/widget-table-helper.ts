import dayjs from 'dayjs';
import { cloneDeep, sortBy } from 'lodash';

import { sortArrayInObjectArray } from '@cloudforet/core-lib';

import type { AllReferenceTypeInfo, ReferenceType } from '@/store/reference/all-reference-store';

import { getTimeUnitByGranularity } from '@/services/cost-explorer/lib/helper';
import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import type { Granularity, GroupBy } from '@/services/dashboards/widgets/_configs/config';

/**
 * @name getWidgetTableDateFields
 * @description Get refined PDataTable fields.
 * @example [{ name: 'cost_sum.0.value', label: '2022-09' }, ...]
 */
export const getWidgetTableDateFields = (
    granularity: Granularity,
    dateRange: DateRange,
    textOptions: Field['textOptions'],
    fieldsKey = 'cost_sum',
): Field[] => {
    if (!granularity || !dateRange?.end) return [];
    const dateFields: Field[] = [];
    const start = dayjs.utc(dateRange.start);
    const end = dayjs.utc(dateRange.end);

    const timeUnit = getTimeUnitByGranularity(granularity);
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
            name: `${fieldsKey}.${count}.value`,
            label: now.locale('en').format(labelDateFormat),
            textAlign: 'right',
            textOptions,
        });
        now = now.add(1, timeUnit);
        count += 1;
    }
    return dateFields;
};

interface RawData {
    [key: string]: any
}
/**
 * @name getRefinedDateTableData
 * @description set data of empty date. This is necessary for index-oriented fields, like `cost_sum.0.value`
 * @example (before) [{ date: '2023-01' }]
 * @example (after) [{ date: '2022-10' }, { date: '2022-11' }, { date: '2022-12' }, { date: '2023-01' }]
 */
export const getRefinedDateTableData = <Data extends RawData = RawData>(
    targetData: Data[],
    dateRange: DateRange,
    fieldKey:string|string[] = 'cost_sum',
    dateKey = 'date',
    additionalData = {},
): Data[] => {
    if (!targetData?.length) return [];
    const fieldKeys = typeof fieldKey === 'string' ? [fieldKey] : fieldKey;
    return targetData.map((result) => {
        const refined: any = { ...result };
        fieldKeys.forEach((key) => {
            const fieldData = result[key];
            if (!Array.isArray(fieldData)) return;
            refined[key] = fillEmptyDateToObjectArray(fieldData, dateRange, dateKey, additionalData);
        });
        return refined;
    });
};
export const fillEmptyDateToObjectArray = <Data extends RawData = RawData>(fieldData: Data[], dateRange: DateRange, dateKey: string, additionalData = {},
): Data[] => {
    const _fieldData = cloneDeep(fieldData);
    let start = dayjs.utc(dateRange.start).clone();
    while (start.isSameOrBefore(dayjs.utc(dateRange.end), 'month')) {
        const _date = start.format('YYYY-MM');
        if (!_fieldData.find((d) => d.date === _date)) {
            _fieldData.push({ ...additionalData, [dateKey]: _date } as RawData as Data);
        }
        start = start.add(1, 'month');
    }
    return sortBy(_fieldData, dateKey);
};


// TODO: remove this after refactoring
export const sortTableData = <Data extends RawData = RawData>(
    rawData: Data[],
    sortKey = 'date',
    targetFieldKeys: string[] = ['cost_sum', 'usage_quantity_sum'],
): Data[] => sortArrayInObjectArray<Data>(rawData, sortKey, targetFieldKeys);

export const getReferenceTypeOfGroupBy = (allReferenceTypeInfo: AllReferenceTypeInfo, groupBy: GroupBy): ReferenceType | undefined => {
    const referenceTypeInfo = Object.values(allReferenceTypeInfo).find((info) => info.key === groupBy);
    if (referenceTypeInfo) return referenceTypeInfo.type;
    return undefined;
};
