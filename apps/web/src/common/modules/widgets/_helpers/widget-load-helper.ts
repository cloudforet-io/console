import dayjs from 'dayjs';

import type { Query } from '@cloudforet/core-lib/space-connector/type';

import { SUB_TOTAL_NAME } from '@/common/modules/widgets/_constants/widget-field-constant';
import { getDateFormat, getTimeUnit } from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';


export const getWidgetLoadApiQueryDateRange = (granularity: string, dateRange: DateRange): DateRange => {
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

export const getWidgetLoadApiQuerySort = (xAxisField: string, dataField: string[], isPivot?: boolean): Query['sort'] => {
    if (xAxisField === 'Date') {
        return [{ key: 'Date', desc: true }];
    }
    if (isPivot) {
        return [{ key: SUB_TOTAL_NAME, desc: true }];
    }
    return dataField?.map((field) => ({ key: field, desc: true }));
};
