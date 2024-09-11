import dayjs from 'dayjs';

import type { Query } from '@cloudforet/core-lib/space-connector/type';

import { getDateFormat, getTimeUnit } from '@/common/modules/widgets/_helpers/widget-date-helper';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import type { TableDataFieldValue } from '@/common/modules/widgets/_widget-fields/table-data-field/type';
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

export const getWidgetLoadApiQuery = (dataFieldInfo: TableDataFieldValue, xAxisField: string): Record<string, any> => {
    const _dataFieldType = dataFieldInfo.fieldType;
    const _dataField = _dataFieldType === 'staticField' ? dataFieldInfo.staticFieldInfo?.fieldValue : dataFieldInfo.dynamicFieldInfo?.fieldValue;
    const _criteria = dataFieldInfo?.dynamicFieldInfo?.criteria;
    const _dynamicFixedFieldValue = dataFieldInfo?.dynamicFieldInfo?.fixedValue;

    const _fields = {};
    let _groupBy: string[] = [xAxisField];
    let _field_group: string[] = [];
    let _sort: Query['sort'] = [];
    let _filter: Query['filter'] = [];
    if (_dataFieldType === 'staticField') {
        _dataField?.forEach((field) => {
            _fields[field] = { key: field, operator: 'sum' };
        });
        _sort = _groupBy.includes('Date') ? [{ key: 'Date', desc: false }] : _dataField?.map((field) => ({ key: field, desc: true }));
    } else {
        _fields[_criteria] = { key: _criteria, operator: 'sum' };
        _field_group = [_dataField];
        _groupBy = [..._groupBy, _dataField];
        _sort = _groupBy.includes('Date') && !_field_group.includes('Date') ? [{ key: 'Date', desc: false }] : [{ key: `_total_${_criteria}`, desc: true }];
    }
    if (isDateField(_dataField) && _dataFieldType === 'dynamicField' && _dynamicFixedFieldValue?.length) {
        _dynamicFixedFieldValue.sort();
        _filter = [{
            k: _dataField,
            v: _dynamicFixedFieldValue,
            o: 'in',
        }];
    }
    return {
        fields: _fields,
        groupBy: _groupBy,
        field_group: _field_group,
        sort: _sort,
        filter: _filter,
    };
};
