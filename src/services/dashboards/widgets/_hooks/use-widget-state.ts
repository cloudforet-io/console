import type { ComputedRef, UnwrapRef } from 'vue';
import {
    computed, reactive,
} from 'vue';

import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import dayjs from 'dayjs';
import { flattenDeep, isEmpty, merge } from 'lodash';

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
import { GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';
import type { InheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';
import { getWidgetInheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';

const getRefinedOptions = (
    configOptions?: WidgetOptions,
    optionsData?: WidgetOptions,
    inheritOptions?: InheritOptions,
    dashboardVariables?: DashboardVariables,
    optionsErrorMap?: InheritOptionsErrorMap,
): WidgetOptions => {
    const mergedOptions = merge({}, configOptions, optionsData);
    if (!inheritOptions || !dashboardVariables) return mergedOptions;

    const parentOptions: Partial<WidgetOptions> = {
        filters: convertInheritOptionsToWidgetFiltersMap(inheritOptions, dashboardVariables, optionsErrorMap),
    };
    return merge({}, mergedOptions, parentOptions);
};

const convertInheritOptionsToWidgetFiltersMap = (
    inheritOptions: InheritOptions,
    dashboardVariables: DashboardVariables,
    optionsErrorMap?: InheritOptionsErrorMap,
): WidgetFiltersMap => {
    const result: WidgetFiltersMap = {};
    Object.entries(inheritOptions).forEach(([filterKey, inheritOption]) => {
        if (optionsErrorMap?.[filterKey]) return;

        const variableKey = inheritOption?.variable_info?.key;
        if (!inheritOption?.enabled || !variableKey) return;

        const variableValue = dashboardVariables[variableKey];
        if (!variableValue || !variableValue?.length) return;

        const _filterKey = filterKey.replace('filters.', '');
        if (variableValue) result[_filterKey] = [{ k: _filterKey, v: variableValue, o: '=' }];
    });
    return result;
};

const getConvertedBudgetConsoleFilters = (widgetFiltersMap: WidgetFiltersMap): ConsoleFilter[] => {
    const results: ConsoleFilter[] = [];
    Object.entries(widgetFiltersMap).forEach(([filterKey, filterItems]) => {
        if (!filterItems?.length) return;
        if ((filterKey === GROUP_BY.PROJECT || filterKey === GROUP_BY.PROJECT_GROUP)) {
            filterItems.forEach((d) => {
                results.push(d);
            });
        } else {
            filterItems.forEach((d) => {
                results.push({
                    k: `cost_types.${filterKey}`,
                    v: [null, ...d.v],
                    o: d.o,
                });
            });
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
    budgetConsoleFilters: ComputedRef<ConsoleFilter[]>;
    optionsErrorMap: ComputedRef<InheritOptionsErrorMap>;
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
            state.optionsErrorMap,
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
        settings: computed<DashboardSettings>(() => ({
            ...props.dashboardSettings,
            date_range: props.dashboardSettings.date_range?.enabled ? props.dashboardSettings.date_range : {
                enabled: false,
                start: dayjs.utc().format('YYYY-MM'),
                end: dayjs.utc().format('YYYY-MM'),
            },
            currency: props.dashboardSettings.currency?.enabled ? props.dashboardSettings.currency : {
                enabled: false,
                value: CURRENCY.USD,
            },
        })),
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
        consoleFilters: computed(() => {
            if (!state.options?.filters || isEmpty(state.options.filters)) return [];
            return flattenDeep(Object.values(state.options.filters));
        }),
        budgetConsoleFilters: computed(() => {
            if (!state.options?.filters || isEmpty(state.options.filters)) return [];
            return getConvertedBudgetConsoleFilters(state.options.filters);
        }),
        optionsErrorMap: computed(() => getWidgetInheritOptionsErrorMap(
            props.inheritOptions,
            state.widgetConfig?.options_schema?.schema,
            props.dashboardVariablesSchema,
        )),
    }) as UnwrapRef<WidgetState<Data>>;

    return state;
}
