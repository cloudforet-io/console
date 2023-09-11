import type { ComputedRef, Ref } from 'vue';
import { computed, reactive, toRef } from 'vue';

import dayjs from 'dayjs';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

interface DateRangeFormatterOptions {
    start?: string|Ref<string|undefined>|ComputedRef<string|undefined>;
    end?: string|Ref<string|undefined>|ComputedRef<string|undefined>;
    showTildeIfStartAndEndThisMonth?: boolean; // show tilde if start and end are the same year and month, and end month is this month.
}

/**
 * @param options
 * @description This composable is used to format the date range.
 * @returns [formattedDate, isEndThisMonth]
 * formattedDate: The formatted date range.
 * isEndThisMonth: Whether the end date is this month.
 * @example
 // With the same year and month, it will be displayed in the format of "Aug, 2023".
 const [formattedDate] = useDateRangeFormatter({
    start: '2023-08',
    end: '2023-08',
});
 // With the same year and different month, it will be displayed in the format of "Aug ~ Sep, 2023".
 const [formattedDate] = useDateRangeFormatter({
     start: '2023-08',
     end: '2023-09',
 });
// With the different year to the start and end, it will be displayed in the format of "Aug 2022 ~ Aug 2023".
 const [formattedDate] = useDateRangeFormatter({
     start: '2022-08',
     end: '2023-08',
 });
 // If end is this month, it will be displayed in the format of "Sep 11, 2023".
 const [formattedDate, isEndThisMonth] = useDateRangeFormatter({
     start: '2023-09',
     end: '2023-09',
 });

 */
export const useDateRangeFormatter = (options: DateRangeFormatterOptions) => {
    const { i18nDayjs } = useI18nDayjs();
    const dateFormatter = (date: string, format: string) => i18nDayjs.value.utc(date).format(format);

    const currentDateRange = {
        start: dayjs.utc().startOf('month').format('YYYY-MM-DD'),
        end: dayjs.utc().format('YYYY-MM-DD'),
    };

    const state = reactive({
        _start: options.start,
        _end: options.end,
        start: computed<string>(() => state._start ?? currentDateRange.start),
        end: computed<string>(() => state._end ?? currentDateRange.end),
        isStartEndTheSameMonth: computed(() => dateFormatter(state.start, 'M') === dateFormatter(state.end, 'M')),
        isStartEndTheSameYear: computed(() => dateFormatter(state.start, 'YYYY') === dateFormatter(state.end, 'YYYY')),
        isEndThisMonth: computed<boolean>(() => dateFormatter(currentDateRange.end, 'M') === dateFormatter(state.end, 'M')),
    });

    const formattedDate = computed<string>(() => {
        const start = state.start;
        const end = state.end;

        if (state.isStartEndTheSameYear) {
            if (state.isStartEndTheSameMonth) {
                if (state.isEndThisMonth) {
                    const formatted = `${dateFormatter(currentDateRange.end, 'MMM D, YYYY')}`;
                    if (options.showTildeIfStartAndEndThisMonth) return `~${formatted}`;
                    return formatted;
                }
                return `${dateFormatter(start, 'MMM, YYYY')}`;
            }

            if (state.isEndThisMonth) return `${dateFormatter(start, 'MMM')} ~ ${dateFormatter(end, 'MMM D, YYYY')}`;
            return `${dateFormatter(start, 'MMM')} ~ ${dateFormatter(end, 'MMM YYYY')}`;
        }

        if (state.isEndThisMonth) return `${dateFormatter(start, 'MMM YYYY')} ~ ${dateFormatter(end, 'MMM D, YYYY')}`;
        return `${dateFormatter(start, 'MMM YYYY')} ~ ${dateFormatter(end, 'MMM YYYY')}`;
    });

    return [formattedDate, toRef(state, 'isEndThisMonth')];
};
