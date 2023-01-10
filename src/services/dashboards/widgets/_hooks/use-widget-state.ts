import type { ComputedRef, UnwrapRef } from 'vue';
import {
    computed, reactive,
} from 'vue';

import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { isEmpty, merge } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY } from '@/store/modules/display/config';

import type { ChartType } from '@/services/cost-explorer/cost-dashboard/type';
import type { DashboardSettings, DashboardVariables } from '@/services/dashboards/config';
import type {
    WidgetConfig, WidgetOptions, WidgetSize,
    InheritOptions, WidgetProps,
    Granularity, GroupBy,
    SelectorType,
    WidgetFiltersMap,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';

const getRefinedOptions = (
    configOptions?: WidgetOptions,
    optionsData?: WidgetOptions,
    inheritOptions?: InheritOptions,
    dashboardVariables?: DashboardVariables,
): WidgetOptions => {
    const mergedOptions = merge({}, configOptions, optionsData);
    if (!inheritOptions || !dashboardVariables) return mergedOptions;

    const parentOptions = {};
    Object.keys(inheritOptions).forEach((key) => {
        if (inheritOptions[key].enabled && inheritOptions[key].variable_info?.key === key) {
            parentOptions[key] = dashboardVariables[key];
        }
    });
    return merge({}, mergedOptions, parentOptions);
};

const convertWidgetFiltersToConsoleFilters = (filters?: WidgetFiltersMap): ConsoleFilter[] => {
    if (!filters || isEmpty(filters)) return [];
    const results: ConsoleFilter[] = [];
    Object.entries(filters).forEach(([property, widgetFilters]) => {
        const values = widgetFilters.map((d) => d.v);
        if (property && values.length) {
            results.push({ k: property, v: values, o: '=' });
        }
    });
    return results;
};


export interface WidgetState<Data = any> {
    widgetConfig: ComputedRef<WidgetConfig>;
    title: ComputedRef<string|undefined>;
    options: ComputedRef<WidgetOptions>;
    currency: ComputedRef<Currency>;
    groupBy: ComputedRef<GroupBy | string | undefined>;
    granularity: ComputedRef<Granularity|undefined>;
    chartType: ComputedRef<ChartType|undefined>;
    size: ComputedRef<WidgetSize|undefined>;
    loading: boolean;
    settings: ComputedRef<DashboardSettings|undefined>;
    data: undefined|Data;
    selectorItems: ComputedRef<MenuItem[]>;
    selectedSelectorType?: SelectorType;
    pageSize: ComputedRef<number|undefined>;
    consoleFilters: ComputedRef<ConsoleFilter[]>;
}
export function useWidgetState<Data = any>(
    props: WidgetProps,
) {
    const state = reactive<WidgetState<Data>>({
        widgetConfig: computed<WidgetConfig>(() => getWidgetConfig(props.widgetConfigId)),
        title: computed(() => props.title ?? state.widgetConfig.title),
        options: computed<WidgetOptions>(() => getRefinedOptions(
            state.widgetConfig.options,
            props.options,
            props.inheritOptions,
            props.dashboardVariables,
        )),
        currency: computed(() => state.settings?.currency?.value ?? CURRENCY.USD),
        groupBy: computed(() => state.options?.group_by),
        granularity: computed(() => state.options?.granularity),
        chartType: computed<ChartType|undefined>(() => state.options?.chart_type),
        size: computed(() => {
            if (props.size && state.widgetConfig.sizes.includes(props.size)) return props.size;
            return state.widgetConfig.sizes[0];
        }),
        loading: true,
        settings: computed<DashboardSettings|undefined>(() => props.dashboardSettings),
        data: undefined as Data|undefined,
        selectorItems: computed<MenuItem[]>(() => {
            if (!state.options?.selector_options?.enabled) return [];
            if (state.options?.selector_options.type === 'cost-usage') {
                if (!state.selectedSelectorType) state.selectedSelectorType = 'cost';
                return [
                    { type: 'item', name: 'cost', label: 'Cost' },
                    { type: 'item', name: 'usage', label: 'Usage' },
                ];
            }
            if (!state.selectedSelectorType) state.selectedSelectorType = 'day';
            return [
                { type: 'item', name: 'day', label: 'Day' },
                { type: 'item', name: 'month', label: 'Month' },
            ];
        }),
        selectedSelectorType: undefined,
        pageSize: computed(() => {
            if (state.options?.pagination_options?.enabled) return state.options.pagination_options.page_size;
            return undefined;
        }),
        consoleFilters: computed(() => convertWidgetFiltersToConsoleFilters(state.options?.filters)),
    }) as UnwrapRef<WidgetState<Data>>;

    return state;
}
