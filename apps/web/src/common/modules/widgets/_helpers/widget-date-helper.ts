import type { ManipulateType } from 'dayjs';
import dayjs from 'dayjs';

import { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type { DateFormat } from '@/common/modules/widgets/types/widget-field-value-type';

import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';


export const getTimeUnit = (granularity: string): ManipulateType => {
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
        if (granularity === 'DAILY') {
            const now = dayjs.utc();
            const endDate = dayjs.utc(end);

            if (now.isSame(endDate, 'month')) {
                return now.format(_dateFormat);
            }
            return endDate.endOf('month').format(_dateFormat);
        }
        return dayjs.utc(end).format(_dateFormat);
    }
    return dayjs.utc().format(_dateFormat);
};

/**
 * @name getWidgetDateFields
 * @description Get date fields based on granularity, start, end
 * @example ('MONTHLY', '2024-03', '2024-06') ['2024-03', '2024-04', '2024-05', '2024-06']
 */
export const getWidgetDateFields = (granularity: string, start?: string, end?: string): string[] => {
    const _timeUnit = getTimeUnit(granularity);
    const _dateFormat = getDateFormat(granularity);

    const results: string[] = [];
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

export const getReferenceLabel = (allReferenceTypeInfo: AllReferenceTypeInfo, field?: string, val?: string) => {
    if (!val) return '';
    if (field === 'Workspace' || field === 'workspace_id') {
        return allReferenceTypeInfo.workspace.referenceMap[val]?.label ?? val;
    }
    if (field === 'Project' || field === 'project_id') {
        return allReferenceTypeInfo.project.referenceMap[val]?.label ?? val;
    }
    if (field === 'Region') {
        return allReferenceTypeInfo.region.referenceMap[val]?.name || val;
    }
    if (field === 'Provider' || field === 'provider') {
        return allReferenceTypeInfo.provider.referenceMap[val]?.label || val;
    }
    if (field === 'Service Account' || field === 'service_account_id') {
        return allReferenceTypeInfo.service_account.referenceMap[val]?.label || val;
    }
    return val;
};

export const getApiQueryDateRange = (granularity: string, dateRange: DateRange): DateRange => {
    const _timeUnit = getTimeUnit(granularity);
    const _dateFormat = getDateFormat(granularity);
    const _start = dayjs.utc(dateRange.start);
    const _end = dayjs.utc(dateRange.end);
    if (granularity === 'DAILY') {
        if (_end.diff(_start, _timeUnit) > 31) {
            return {
                start: _end.subtract(31, _timeUnit).format(_dateFormat),
                end: _end.format(_dateFormat),
            };
        }
    } else if (granularity === 'MONTHLY') {
        if (_end.diff(_start, _timeUnit) > 12) {
            return {
                start: _end.subtract(11, _timeUnit).format(_dateFormat),
                end: _end.format(_dateFormat),
            };
        }
    } else if (granularity === 'YEARLY') {
        if (_end.diff(_start, _timeUnit) > 3) {
            return {
                start: _end.subtract(2, _timeUnit).format(_dateFormat),
                end: _end.format(_dateFormat),
            };
        }
    }
    return dateRange;
};

export const getRefinedDateFormatByGranularity = (granularity: string, dateFormat: DateFormat): string => DATE_FORMAT[dateFormat][granularity];

export const getFormattedDate = (date: string, dateFormat: string): string => {
    const dateFormatsWithMMM = Object.values(DATE_FORMAT['MMM DD, YYYY']) as string[];
    if (dateFormatsWithMMM.includes(dateFormat)) return dayjs.utc(date).locale('en').format(dateFormat);
    return dayjs.utc(date).format(dateFormat);
};
