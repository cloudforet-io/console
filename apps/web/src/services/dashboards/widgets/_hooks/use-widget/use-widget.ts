import type {
    UnwrapRef,
    ComputedRef,
} from 'vue';
import {
    reactive, toRefs,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { DateRange } from '@/services/dashboards/config';
import type { WidgetEmit, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetFrame } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-frame';
import type { WidgetState } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-state';
import {
    useWidgetState,
} from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-state';

interface AdditionalState {
    dateRange?: DateRange|ComputedRef<DateRange>;
    widgetLocation?: ComputedRef<Location|undefined>; // overwrites whole widgetLocation
    consoleFilters?: ComputedRef<ConsoleFilter[]>; // overwrites whole consoleFilters
    // use belows if you want to overwrite specific cases (useful in base widget)
    assetWidgetLocation?: Location|ComputedRef<Location|undefined>; // overwrites widgetLocation for 'Asset' label.
    costWidgetLocation?: Location|ComputedRef<Location|undefined>; // overwrites widgetLocation for 'Cost' label
    budgetConsoleFilters?: ComputedRef<ConsoleFilter[]>; // overwrites consoleFilters for 'Budget' label
    cloudServiceAnalyzeConsoleFilters?: ComputedRef<ConsoleFilter[]>; // overwrites consoleFilters for both 'Asset' label and 'realtime' data criteria
}

/**
 * @example
 const { widgetState, widgetFrameProps } = useWidget(props, {
    dateRange: computed<DateRange>(() => {
        const end = widgetState.settings?.date_range?.end ?? dayjs.utc().format('YYYY-MM');
        const start = widgetState.settings?.date_range?.start ?? dayjs.utc().format('YYYY-MM');
        return { start, end };
    }),
    costWidgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
    })),
 });
 */
export const useWidget = (props: WidgetProps, emit: WidgetEmit, additionalState: AdditionalState = {}) => {
    const state = useWidgetState(props);

    const widgetState = reactive({
        ...toRefs(state),
        ...additionalState,
    }) as UnwrapRef<WidgetState>;

    const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, widgetState);

    return {
        widgetState,
        widgetFrameProps,
        widgetFrameEventHandlers,
    };
};
