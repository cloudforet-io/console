import type { ComputedRef } from 'vue';
import { computed, reactive, toRef } from 'vue';

import dayjs from 'dayjs';

import { getDateFormat } from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { DateRangeValue, DateRangeValueType } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';


interface UseWidgetDateRangeOptions {
    dateRangeFieldValue: ComputedRef<DateRangeValue>;
    baseOnDate: ComputedRef<string|undefined>;
    granularity: ComputedRef<string>;
    usePreviewFormat?: boolean;
}

interface UseWidgetDateRangeState {
    isInherit: ComputedRef<boolean>;
    dateRangeOptions: ComputedRef<DateRangeValue['options']>;
    dateRange: ComputedRef<DateRange>;
    baseOnDate: ComputedRef<string|undefined>
}

interface UseWidgetDateRangeReturnType {
    dateRange: ComputedRef<DateRange>;
}

export const useWidgetDateRange = (options: UseWidgetDateRangeOptions): UseWidgetDateRangeReturnType => {
    const {
        baseOnDate: _baseOnDate,
        granularity: _granularity,
        usePreviewFormat: _usePreviewFormat,
    } = options;

    const state = reactive<UseWidgetDateRangeState>({
        isInherit: computed<boolean>(() => !!options.dateRangeFieldValue.value?.inherit),
        dateRangeOptions: computed<DateRangeValue['options']>(() => options.dateRangeFieldValue.value?.options || 'auto'),
        baseOnDate: computed<string|undefined>(() => (state.isInherit ? _baseOnDate.value : undefined)),
        dateRange: computed<DateRange>(() => {
            const dateRangePresetKey = state.dateRangeOptions?.value || 'auto';
            const { start: _start, end: _end } = state.dateRangeOptions || {};

            if (dateRangePresetKey === 'custom') {
                return state.isInherit ? getWidgetDateRangeByCustomRelativeNumberUnit(_granularity.value, state.baseOnDate, _start, _end)
                    : getWidgetDateRangeByCustomFixedDateRange(_granularity.value, _start, _end);
            }

            return getWidgetDateRangeByPresetKey(_granularity.value, state.baseOnDate, dateRangePresetKey, _usePreviewFormat);
        }),
    });

    const getWidgetDateRangeByPresetKey = (
        granularity: string,
        basedOnDate: string|undefined,
        relativeDateRangeValue: DateRangeValueType,
        usePreviewFormat?: boolean,
    ): DateRange => {
        const _dateFormat = getDateFormat(granularity);

        const thisYear = dayjs.utc(basedOnDate).year();
        const thisMonth = dayjs.utc(basedOnDate).month() + 1;
        const baseDate = basedOnDate ? dayjs.utc(basedOnDate).endOf('month') : dayjs.utc(basedOnDate);

        // Results
        let _start = '';
        let _end = '';

        if (granularity === 'MONTHLY') {
            if (relativeDateRangeValue === 'auto') {
                _start = baseDate.subtract(11, 'month').startOf('month').format('YYYY-MM-DD');
                _end = baseDate.endOf('month').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'thisMonth') {
                _start = baseDate.startOf('month').format('YYYY-MM-DD');
                _end = baseDate.endOf('month').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastMonth') {
                const lastMonthDate = baseDate.subtract(1, 'month');
                _start = lastMonthDate.startOf('month').format('YYYY-MM-DD');
                _end = lastMonthDate.endOf('month').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastTwoMonths') {
                const lastMonthDate = baseDate.subtract(2, 'month');
                _start = lastMonthDate.startOf('month').format('YYYY-MM-DD');
                _end = lastMonthDate.endOf('month').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'thisQuarter') {
                if (thisMonth >= 1 && thisMonth <= 3) {
                    _start = `${thisYear}-01-01`;
                    _end = `${thisYear}-03-31`;
                } else if (thisMonth >= 4 && thisMonth <= 6) {
                    _start = `${thisYear}-04-01`;
                    _end = `${thisYear}-06-30`;
                } else if (thisMonth >= 7 && thisMonth <= 9) {
                    _start = `${thisYear}-07-01`;
                    _end = `${thisYear}-09-30`;
                } else if (thisMonth >= 10 && thisMonth <= 12) {
                    _start = `${thisYear}-10-01`;
                    _end = `${thisYear}-12-31`;
                }
            } else if (relativeDateRangeValue === 'lastQuarter') {
                if (thisMonth >= 1 && thisMonth <= 3) {
                    _start = `${thisYear}-10-01`;
                    _end = `${thisYear}-12-31`;
                } else if (thisMonth >= 4 && thisMonth <= 6) {
                    _start = `${thisYear}-01-01`;
                    _end = `${thisYear}-03-31`;
                } else if (thisMonth >= 7 && thisMonth <= 9) {
                    _start = `${thisYear}-04-01`;
                    _end = `${thisYear}-06-30`;
                } else if (thisMonth >= 10 && thisMonth <= 12) {
                    _start = `${thisYear}-07-01`;
                    _end = `${thisYear}-09-30`;
                }
            }
        }
        if (granularity === 'DAILY') {
            if (relativeDateRangeValue === 'auto') {
                const baseMonthDayCount = baseDate.daysInMonth();
                const _date = baseDate.date();
                const isEndOfMonth = _date === baseDate.endOf('month').date();

                _start = baseDate.subtract(isEndOfMonth ? baseMonthDayCount - 1 : 29, 'day').format('YYYY-MM-DD');
                _end = baseDate.format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'today') {
                _start = baseDate.format('YYYY-MM-DD');
                _end = baseDate.format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'yesterday') {
                _start = baseDate.subtract(1, 'day').format('YYYY-MM-DD');
                _end = baseDate.subtract(1, 'day').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastTwoDays') {
                _start = baseDate.subtract(2, 'day').format('YYYY-MM-DD');
                _end = baseDate.subtract(2, 'day').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastSevenDays') {
                _start = baseDate.subtract(7, 'day').format('YYYY-MM-DD');
                _end = baseDate.subtract(7, 'day').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastFourteenDays') {
                _start = baseDate.subtract(14, 'day').format('YYYY-MM-DD');
                _end = baseDate.subtract(14, 'day').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastThirtyDays') {
                _start = baseDate.subtract(30, 'day').format('YYYY-MM-DD');
                _end = baseDate.subtract(30, 'day').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'thisWeek') {
                _start = baseDate.startOf('week').format('YYYY-MM-DD');
                _end = baseDate.endOf('week').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'thisWeekToDate') {
                _start = baseDate.startOf('week').format('YYYY-MM-DD');
                _end = baseDate.format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastWeek') {
                _start = baseDate.subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
                _end = baseDate.subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
            }
        }
        if (granularity === 'YEARLY') {
            if (relativeDateRangeValue === 'auto') {
                _start = baseDate.subtract(2, 'year').startOf('year').format('YYYY-MM-DD');
                _end = baseDate.endOf('year').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'thisYear') {
                _start = baseDate.startOf('year').format('YYYY-MM-DD');
                _end = baseDate.endOf('year').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastYear') {
                _start = baseDate.subtract(1, 'year').startOf('year').format('YYYY-MM-DD');
                _end = baseDate.subtract(1, 'year').endOf('year').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastTwoYears') {
                _start = baseDate.subtract(2, 'year').startOf('year').format('YYYY-MM-DD');
                _end = baseDate.subtract(2, 'year').endOf('year').format('YYYY-MM-DD');
            }
        }

        if (usePreviewFormat) {
            return {
                start: _start,
                end: _end,
            };
        }
        return {
            start: dayjs.utc(_start).format(_dateFormat),
            end: dayjs.utc(_end).format(_dateFormat),
        };
    };

    const getWidgetDateRangeByCustomFixedDateRange = (granularity:string, start: string, end: string): DateRange => {
        const _dateFormat = getDateFormat(granularity);

        return {
            start: dayjs.utc(start).format(_dateFormat),
            end: dayjs.utc(end).format(_dateFormat),
        };
    };
    const getWidgetDateRangeByCustomRelativeNumberUnit = (
        granularity: string,
        basedOnDate: string|undefined,
        start: number,
        end: number,
    ): DateRange => {
        const _dateFormat = getDateFormat(granularity);

        const baseYear = dayjs.utc(basedOnDate).year();
        const baseMonth = dayjs.utc(basedOnDate).month() + 1;

        // Results
        let _start = '';
        let _end = '';

        if (granularity === 'YEARLY') {
            _start = `${start}`;
            _end = `${end}`;
        } else if (granularity === 'MONTHLY') {
            _start = `${baseYear}-${start}`;
            _end = `${baseYear}-${end}`;
        } else {
            _start = `${baseYear}-${baseMonth}-${start}`;
            _end = `${baseYear}-${baseMonth}-${end}`;
        }

        return {
            start: dayjs.utc(_start).format(_dateFormat),
            end: dayjs.utc(_end).format(_dateFormat),
        };
    };


    return {
        dateRange: toRef<UseWidgetDateRangeState, 'dateRange'>(state, 'dateRange'),
    };
};
