
import type { ComputedRef, UnwrapRef } from 'vue';
import { computed, isRef } from 'vue';

import dayjs from 'dayjs';

import type { DateRange } from '@/services/dashboards/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import type { WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import type { BaseWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget/use-base-widget-state';
import type { OverridableWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';

export const useWidgetDateRange = (props: WidgetProps, widgetState: UnwrapRef<BaseWidgetState>, overrides: OverridableWidgetState = {}): ComputedRef<DateRange> => {
    if (isRef(overrides.dateRange)) return overrides.dateRange;
    const dateRange = computed<DateRange>(() => {
        if (overrides.dateRange) return overrides.dateRange as DateRange;
        const dateRangeFormat = widgetState.granularity === GRANULARITY.YEARLY ? 'YYYY' : 'YYYY-MM';
        const end = dayjs.utc(widgetState.settings?.date_range?.end).format(dateRangeFormat);
        const start = dayjs.utc(widgetState.settings?.date_range?.start).format(dateRangeFormat);
        return { start, end };
    });
    return dateRange;
};
