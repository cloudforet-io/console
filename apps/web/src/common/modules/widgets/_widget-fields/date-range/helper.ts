import dayjs from 'dayjs';

import { i18n } from '@/translations';

import { DATE_RANGE_ADVANCED_OPERATOR_MAP } from '@/common/modules/widgets/_widget-fields/date-range/constant';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';


export const checkInvalidCustomValue = (fieldValue: DateRangeValue, granularity: GranularityValue['granularity']) => {
    const _value = fieldValue?.options?.value;
    if (_value === 'custom') {
        if (!fieldValue.options.start || !fieldValue.options.end) return { invalid: true, text: '' };
        if (fieldValue?.inherit) {
            const inheritCustomStartValue = fieldValue?.options?.start || 0;
            const inheritCustomEndValue = fieldValue?.options?.end || 0;
            if (inheritCustomStartValue > inheritCustomEndValue) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_RANGE_TEXT') };
            const gap = inheritCustomEndValue - inheritCustomStartValue;
            if (granularity === 'YEARLY' && gap >= 3) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
            if (granularity === 'MONTHLY' && gap >= 12) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
            if (granularity === 'DAILY' && gap >= 31) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
        } else {
            const _startDate = dayjs.utc(fieldValue?.options?.start);
            const _endDate = dayjs.utc(fieldValue?.options.end);
            if (granularity === 'YEARLY' && _endDate.diff(_startDate, 'year') >= 3) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
            if (granularity === 'MONTHLY' && _endDate.diff(_startDate, 'month') >= 12) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
            if (granularity === 'DAILY' && _endDate.diff(_startDate, 'day') >= 31) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
            if (_startDate.isAfter(_endDate)) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_RANGE_TEXT') };
        }
    } else if (_value === 'advanced') {
        if (
            (fieldValue.options.start === undefined || fieldValue.options.end === undefined)
            || (Number.isNaN(fieldValue.options.start) || Number.isNaN(fieldValue.options.end))
        ) return { invalid: true, text: '' };
        const _startOperator = fieldValue?.options?.start_operator;
        const _endOperator = fieldValue?.options?.end_operator;
        const _start = fieldValue?.options?.start as number|undefined;
        const _end = fieldValue?.options?.end as number|undefined;
        const _startValue: number = _startOperator === DATE_RANGE_ADVANCED_OPERATOR_MAP.ADD ? _start || 0 : (_start || 0) * -1;
        const _endValue: number = _endOperator === DATE_RANGE_ADVANCED_OPERATOR_MAP.ADD ? _end || 0 : (_end || 0) * -1;

        const gap = _endValue - _startValue;

        if (gap < 0) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_RANGE_TEXT') };
        if (granularity === 'YEARLY' && gap >= 3) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
        if (granularity === 'MONTHLY' && gap >= 12) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
        if (granularity === 'DAILY' && gap >= 31) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
    }
    return { invalid: false, text: '' };
};
