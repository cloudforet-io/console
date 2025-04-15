import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import dayjs from 'dayjs';
import { cloneDeep, sortBy } from 'lodash';

import { GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { DateRange } from '@/api-clients/dashboard/_types/dashboard-type';
import type { Granularity } from '@/api-clients/dashboard/_types/widget-type';

import type { ManagedVariableModelKey } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import type { Field } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-data-table-type';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';

/**
 * @name getWidgetTableDateFields
 * @description Get refined PDataTable fields.
 * @example [{ name: 'value_sum.0.value', label: '2022-09' }, ...]
 */
export const getWidgetTableDateFields = (
    granularity: Granularity|undefined,
    dateRange: DateRange,
    textOptions: Field['textOptions'],
    fieldsKey = 'value_sum',
): Field[] => {
    if (!granularity || !dateRange?.end) return [];
    const dateFields: Field[] = [];
    const start = dayjs.utc(dateRange.start);
    const end = dayjs.utc(dateRange.end);

    let timeUnit: TimeUnit = 'day';
    if (granularity === GRANULARITY.MONTHLY) timeUnit = 'month';
    else if (granularity === GRANULARITY.YEARLY) timeUnit = 'year';

    let labelDateFormat = 'M/D';
    if (timeUnit === 'month') labelDateFormat = 'MMM';
    else if (timeUnit === 'year') labelDateFormat = 'YYYY';

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
 * @description set data of empty date. This is necessary for index-oriented fields, like `value_sum.0.value`
 * @example (before) [{ date: '2023-01' }]
 * @example (after) [{ date: '2022-10' }, { date: '2022-11' }, { date: '2022-12' }, { date: '2023-01' }]
 */
export const getRefinedDateTableData = <Data extends RawData = RawData>(
    targetData: Data[],
    dateRange: DateRange,
    fieldKey:string|string[] = 'value_sum',
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


export const getReferenceTypeOfDataField = (allReferenceTypeInfo: AllReferenceTypeInfo, dataField?: string): ManagedVariableModelKey | undefined => {
    const referenceTypeInfo = Object.values(allReferenceTypeInfo).find((info) => info.key === dataField);
    if (referenceTypeInfo) return referenceTypeInfo.type as ManagedVariableModelKey;
    return undefined;
};
