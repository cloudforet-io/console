import type {
    UnwrapRef,
    Ref,
} from 'vue';
import {
    reactive, toRefs,
} from 'vue';

import type { DateRange } from '@/services/dashboards/config';
import type { WidgetEmit, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import type { AssetWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget/use-asset-widget-state';
import {
    useAssetWidgetState,
} from '@/services/dashboards/widgets/_hooks/use-widget/use-asset-widget-state';
import type { WidgetFrameOptions } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-frame';
import { useWidgetFrame } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-frame';

interface AdditionalState {
    dateRange: Ref<DateRange>;
    widgetLocation?: WidgetFrameOptions['widgetLocation'];
}

/**
 * @example
 const { widgetState, widgetFrameProps } = useAssetWidget(props, {
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
export const useAssetWidget = <T = AdditionalState>(props: WidgetProps, emit: WidgetEmit, additionalState: AdditionalState) => {
    const assetWidgetState = useAssetWidgetState(props);

    const widgetState = reactive({
        ...toRefs(assetWidgetState),
        ...additionalState,
    }) as UnwrapRef<AssetWidgetState & T>;

    const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, widgetState);

    return {
        widgetState,
        widgetFrameProps,
        widgetFrameEventHandlers,
    };
};
