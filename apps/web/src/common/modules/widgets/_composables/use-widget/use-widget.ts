import type {
    UnwrapRef,

    ComputedRef,
    Ref,
} from 'vue';
import {
    computed,
    reactive, toRefs,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { DateRange, DashboardVariables, DashboardVariablesSchema } from '@/schema/dashboard/_types/dashboard-type';
import type { DataMapping, NewWidgetFilters } from '@/schema/dashboard/_types/widget-type';

import type { Currency } from '@/store/modules/settings/type';

import type { BaseWidgetState } from '@/common/modules/widgets/_composables/use-widget/use-base-widget-state';
import { useBaseWidgetState } from '@/common/modules/widgets/_composables/use-widget/use-base-widget-state';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import type { NewWidgetProps, WidgetEmit } from '@/common/modules/widgets/types/widget-display-type';



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
    dateRange: ComputedRef<DateRange|undefined>;
    // TODO: refactoring with dynamic data source
    // widgetLocation: ComputedRef<Location|undefined>; // widget location for link which is differentiated by widget labels(e.g. Cost, Asset)
    // consoleFilters: ComputedRef<ConsoleFilter[]>;

    widgetFilters: NewWidgetFilters|undefined|Ref<NewWidgetFilters|undefined>; // widget options from the dashboard widget layout info.
    filtersSchemaProperties?: string[]|Ref<string[]|undefined>; // widget schema properties from the dashboard widget layout info.
    variablesSchema: DashboardVariablesSchema|undefined|Ref<DashboardVariablesSchema|undefined>; // dashboard variables schema
    variables: DashboardVariables|undefined|Ref<DashboardVariables|undefined>; // dashboard variables
    dataMapping: ComputedRef<DataMapping>;
    currency: Ref<Currency|undefined>;
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
export const useWidget = (props: NewWidgetProps, emit: WidgetEmit, overrides: OverridableWidgetState = {}) => {
    const baseState = useBaseWidgetState(props);

    // additional states that can be overwritten by each widget
    const dateRange = useWidgetDateRange(props, baseState, overrides);
    // TODO: refactoring with dynamic data source
    // const widgetLocation = useWidgetLocation(props, baseState, dateRange, overrides);
    // const consoleFilters = useWidgetConsoleFilters(props, baseState, overrides);

    const widgetState = reactive<WidgetState>({
        ...toRefs(baseState),
        dateRange,

        variables: computed(() => props.variables),
        variablesSchema: computed(() => props.variablesSchema),

        widgetFilters: computed<NewWidgetFilters>(() => props.filters || {}),
        filtersSchemaProperties: computed<string[]>(() => props.filtersSchemaProperties || []),
        currency: computed<Currency|undefined>(() => undefined),
        dataMapping: computed(() => props.dataMapping),
    }) as UnwrapRef<WidgetState>;

    const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, widgetState);

    return {
        widgetState,
        widgetFrameProps,
        widgetFrameEventHandlers,
    };
};
