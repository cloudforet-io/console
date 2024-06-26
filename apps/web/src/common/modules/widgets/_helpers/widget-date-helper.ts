import dayjs from 'dayjs';

import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';

import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';


export const getTimeUnit = (granularity: string): string => {
    if (granularity === 'DAILY') return 'day';
    if (granularity === 'YEARLY') return 'year';
    return 'month';
};
export const getDateFormat = (granularity: string): string => {
    if (granularity === 'DAILY') return 'YYYY-MM-DD';
    if (granularity === 'YEARLY') return 'YYYY';
    return 'YYYY-MM';
};
export const getDateLabelFormat = (granularity: string): string => {
    if (granularity === 'DAILY') return 'MMM D';
    if (granularity === 'YEARLY') return 'YYYY';
    return 'MMM YYYY';
};

/**
 * @name getWidgetBasedOnDate
 * @description Get date based on granularity, end
 * @example ('MONTHLY', '2024-03') '2024-03' // ('YEARLY', '2024-03') '2024'
 */
export const getWidgetBasedOnDate = (granularity: string, end?: string): string => {
    const _dateFormat = getDateFormat(granularity);
    if (end) {
        if (granularity === 'DAILY') return dayjs.utc(end).endOf('month').format(_dateFormat);
        return dayjs.utc(end).format(_dateFormat);
    }
    return dayjs.utc().format(_dateFormat);
};

/**
 * @name getWidgetDateFields
 * @description Get date fields based on granularity, start, end
 * @example ('MONTHLY', '2024-03', '2024-06') ['2024-03', '2024-04', '2024-05', '2024-06']
 */
export const getWidgetDateFields = (granularity: string, start: string, end: string): string[] => {
    const _timeUnit = getTimeUnit(granularity);
    const _dateFormat = getDateFormat(granularity);

    const results = [];
    let now = dayjs.utc(start).clone();
    while (now.isSameOrBefore(dayjs.utc(end), _timeUnit)) {
        results.push(now.format(_dateFormat));
        now = now.add(1, _timeUnit);
    }
    return results;
};

/**
 * @name getWidgetDateRange
 * @description Get start, end date based on granularity, basedOnDate, subtractCount
 * @example ('MONTHLY', '2024-03', 3) ['2023-01', '2024-03']
 */
export const getWidgetDateRange = (granularity: string, basedOnDate: string, subtractCount: number): string[] => {
    const _timeUnit = getTimeUnit(granularity);
    const _dateFormat = getDateFormat(granularity);
    // get start, end with granularity and subtractCount
    const start = dayjs.utc(basedOnDate).clone().subtract(subtractCount - 1, _timeUnit).format(_dateFormat);
    const end = dayjs.utc(basedOnDate).format(_dateFormat);
    return [start, end];
};

export const getReferenceLabel = (allReferenceTypeInfo: AllReferenceTypeInfo, field: string, val?: string) => {
    if (!val) return '';
    if (field === 'Workspace') {
        return allReferenceTypeInfo.workspace.referenceMap[val]?.label ?? val;
    }
    if (field === 'Project') {
        return allReferenceTypeInfo.project.referenceMap[val]?.label ?? val;
    }
    if (field === 'Region') {
        return allReferenceTypeInfo.region.referenceMap[val]?.name || val;
    }
    if (field === 'Provider') {
        return allReferenceTypeInfo.provider.referenceMap[val]?.label || val;
    }
    if (field === 'Service Account') {
        return allReferenceTypeInfo.service_account.referenceMap[val]?.label || val;
    }
    return val;
};

export const getAllRequiredFieldsFilled = (widgetName: string, widgetOptions?: Record<WidgetFieldName, WidgetFieldValues>): boolean => {
    const widgetConfig = getWidgetConfig(widgetName);
    const requiredFields = Object.keys(widgetConfig?.requiredFieldsSchema || {});
    return requiredFields.every((d) => widgetOptions?.[d] !== null && widgetOptions?.[d] !== undefined && widgetOptions?.[d] !== '');
};
