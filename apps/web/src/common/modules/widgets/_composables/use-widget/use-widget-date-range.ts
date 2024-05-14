
import type { ComputedRef, UnwrapRef } from 'vue';
import { computed, isRef } from 'vue';

import dayjs from 'dayjs';

import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { DateRange } from '@/schema/dashboard/_types/dashboard-type';

import type { BaseWidgetState } from '@/common/modules/widgets/_composables/use-widget/use-base-widget-state';
import type { OverridableWidgetState } from '@/common/modules/widgets/_composables/use-widget/use-widget';
import type { NewWidgetProps } from '@/common/modules/widgets/types/widget-display-type';


export const useWidgetDateRange = (props: NewWidgetProps, widgetState: UnwrapRef<BaseWidgetState>, overrides: OverridableWidgetState = {}): ComputedRef<DateRange> => {
    if (isRef(overrides.dateRange)) return overrides.dateRange;
    const dateRange = computed<DateRange>(() => {
        if (overrides.dateRange) return overrides.dateRange as DateRange;
        const dateRangeFormat = widgetState.granularity === GRANULARITY.YEARLY ? 'YYYY' : 'YYYY-MM';
        const end = dayjs.utc(widgetState.dateRange?.end).format(dateRangeFormat);
        const start = dayjs.utc(widgetState?.dateRange?.start).format(dateRangeFormat);
        return { start, end };
    });
    return dateRange;
};
