import type {
    UnwrapRef,
    ComputedRef,
} from 'vue';
import {
    reactive, toRefs,
} from 'vue';
import type { RouteLocationRaw } from 'vue-router';

import type { DateRange } from '@/services/dashboards/config';
import type { WidgetEmit, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetFrame } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-frame';
import type { WidgetState } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-state';
import {
    useWidgetState,
} from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-state';

interface AdditionalState {
    dateRange?: DateRange|ComputedRef<DateRange>;
    widgetLocation?: RouteLocationRaw|ComputedRef<RouteLocationRaw>;
}

/**
 * @example
 const { widgetState, widgetFrameProps } = useWidget(props, {
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
    })),
    dateRange: computed<DateRange>(() => {
        const end = widgetState.settings?.date_range?.end ?? dayjs.utc().format('YYYY-MM');
        const start = widgetState.settings?.date_range?.start ?? dayjs.utc().format('YYYY-MM');
        return { start, end };
    }),
 });
 */
export const useWidget = <T extends AdditionalState = AdditionalState>(props: WidgetProps, emit: WidgetEmit, additionalState: T) => {
    const state = useWidgetState(props);

    const widgetState = reactive({
        ...toRefs(state),
        ...additionalState,
    }) as UnwrapRef<WidgetState & T>;

    const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, widgetState);

    return {
        widgetState,
        widgetFrameProps,
        widgetFrameEventHandlers,
    };
};
