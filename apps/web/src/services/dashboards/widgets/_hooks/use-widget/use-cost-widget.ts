import type { UnwrapRef } from 'vue';
import {
    reactive, toRefs,
} from 'vue';

import type { WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import type { CostWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget/use-cost-widget-state';
import {
    useCostWidgetState,
} from '@/services/dashboards/widgets/_hooks/use-widget/use-cost-widget-state';
import type { WidgetFrameOptions } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-frame';
import { useWidgetFrame } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-frame';

interface AdditionalState {
    dateRange: WidgetFrameOptions['dateRange'];
    widgetLocation: WidgetFrameOptions['widgetLocation'];
}

/**
 * @example
 const { widgetState, widgetFrameProps } = useCostWidget(props, {
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
export const useCostWidget = <T = AdditionalState>(props: WidgetProps, additionalState: AdditionalState) => {
    const costWidgetState = useCostWidgetState(props);

    const widgetState = reactive({
        ...toRefs(costWidgetState),
        ...additionalState,
    }) as UnwrapRef<CostWidgetState & T>;

    const { widgetFrameProps } = useWidgetFrame(props, widgetState);

    return {
        widgetState,
        widgetFrameProps,
    };
};
