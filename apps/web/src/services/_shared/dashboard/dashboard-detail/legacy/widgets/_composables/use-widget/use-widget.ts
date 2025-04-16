import type {
    UnwrapRef,

    ComputedRef,
} from 'vue';
import {
    reactive, toRefs,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { DateRange } from '@/api-clients/dashboard/_types/dashboard-type';

import type {
    BaseWidgetState,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-base-widget-state';
import { useBaseWidgetState } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-base-widget-state';
import { useWidgetConsoleFilters } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget-console-filters';
import { useWidgetDateRange } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget-date-range';
import { useWidgetFrame } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget-frame';
import { useWidgetLocation } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget-location';
import type { WidgetEmit, WidgetProps } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';

export interface OverridableWidgetState {
    dateRange?: DateRange|ComputedRef<DateRange>; // overrides dateRange
    widgetLocation?: ComputedRef<Location|undefined>; // overrides whole widgetLocation. undefined means no link
    consoleFilters?: ComputedRef<ConsoleFilter[]>; // overrides whole consoleFilters

    // use belows if you want to overwrite specific cases (useful in base widget)
    // location
    assetWidgetLocation?: Location|ComputedRef<Location|undefined>; // overrides widgetLocation for 'Asset' label. undefined means no link
    costWidgetLocation?: Location|ComputedRef<Location|undefined>; // overrides widgetLocation for 'Cost' label. undefined means no link
    budgetWidgetLocation?: Location|ComputedRef<Location|undefined>; // overrides widgetLocation for 'Budget' label. undefined means no link
    // filters
    budgetConsoleFilters?: ComputedRef<ConsoleFilter[]>; // overrides consoleFilters for 'Budget' label
    cloudServiceAnalyzeConsoleFilters?: ComputedRef<ConsoleFilter[]>; // overrides consoleFilters for both 'Asset' label and 'realtime' data criteria
}
export interface WidgetState extends BaseWidgetState {
    dateRange: ComputedRef<DateRange>;
    widgetLocation: ComputedRef<Location|undefined>; // widget location for link which is differentiated by widget labels(e.g. Cost, Asset)
    consoleFilters: ComputedRef<ConsoleFilter[]>;
}
/**
 * @example
 const { widgetState, widgetFrameProps } = useWidget(props, emit, {
    dateRange: computed<DateRange>(() => {
        const end = widgetState.settings?.date_range?.end ?? dayjs.utc().format('YYYY-MM');
        const start = widgetState.settings?.date_range?.start ?? dayjs.utc().format('YYYY-MM');
        return { start, end };
    }),
    costWidgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
    })),
    assetWidgetLocation: undefined,
 });
 */
export const useWidget = (props: WidgetProps, emit: WidgetEmit, overrides: OverridableWidgetState = {}) => {
    const baseState = useBaseWidgetState(props);

    // additional states that can be overwritten by each widget
    const dateRange = useWidgetDateRange(props, baseState, overrides);
    const widgetLocation = useWidgetLocation(props, baseState, dateRange, overrides);
    const consoleFilters = useWidgetConsoleFilters(props, baseState, overrides);

    const widgetState = reactive({
        ...toRefs(baseState),
        dateRange,
        widgetLocation,
        consoleFilters,
    }) as UnwrapRef<WidgetState>;

    const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, widgetState);

    return {
        widgetState,
        widgetFrameProps,
        widgetFrameEventHandlers,
    };
};
