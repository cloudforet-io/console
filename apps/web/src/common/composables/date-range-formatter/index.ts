import type { ComputedRef, Ref } from 'vue';
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

interface DateRangeFormatterOptions {
    start?: string|Ref<string|undefined>|ComputedRef<string|undefined>;
    end?: string|Ref<string|undefined>|ComputedRef<string|undefined>;
}
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
                if (state.isEndThisMonth) return `${dateFormatter(currentDateRange.end, 'MMM D, YYYY')}`;
                return `${dateFormatter(start, 'MMM, YYYY')}`;
            }

            return `${dateFormatter(start, 'MMM')} ~ ${dateFormatter(end, 'MMM')} ${dateFormatter(end, 'YYYY')}`;
        }

        return `${dateFormatter(start, 'MMM')} ${dateFormatter(start, 'YYYY')} ~ ${dateFormatter(end, 'MMM')} ${dateFormatter(end, 'YYYY')}`;
    });

    return [formattedDate];
};
