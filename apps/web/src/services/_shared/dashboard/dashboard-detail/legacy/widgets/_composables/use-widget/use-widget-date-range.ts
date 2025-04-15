
import type { ComputedRef, UnwrapRef } from 'vue';
import { computed, isRef } from 'vue';

import dayjs from 'dayjs';

import { GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { DateRange } from '@/api-clients/dashboard/_types/dashboard-type';

import type { BaseWidgetState } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-base-widget-state';
import type { OverridableWidgetState } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import type { WidgetProps } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';

export const useWidgetDateRange = (props: WidgetProps, widgetState: UnwrapRef<BaseWidgetState>, overrides: OverridableWidgetState = {}): ComputedRef<DateRange> => {
    if (isRef(overrides.dateRange)) return overrides.dateRange;
    const dateRange = computed<DateRange>(() => {
        if (overrides.dateRange) return overrides.dateRange as DateRange;
        const dateRangeFormat = widgetState.granularity === GRANULARITY.YEARLY ? 'YYYY' : 'YYYY-MM';
        const end = dayjs.utc(widgetState.dashboardOptions?.date_range?.end).format(dateRangeFormat);
        const start = dayjs.utc(widgetState.dashboardOptions?.date_range?.start).format(dateRangeFormat);
        return { start, end };
    });
    return dateRange;
};
