import type { ComputedRef, UnwrapRef } from 'vue';
import {
    computed, reactive,
} from 'vue';

import dayjs from 'dayjs';
import { flattenDeep, isEmpty, merge } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { CURRENCY } from '@/store/modules/settings/config';

import type { DashboardSettings, DashboardVariables } from '@/services/dashboards/config';
import type {
    WidgetConfig, WidgetOptions,
    InheritOptions, WidgetProps,
    WidgetFilter,
    Granularity,
    AssetGroupBy, CostGroupBy,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetFilterDataKey } from '@/services/dashboards/widgets/_helpers/widget-filters-helper';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';
import type { InheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';
import { getWidgetInheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';
import type { ChartType } from '@/services/dashboards/widgets/type';

export interface WidgetBaseState {
    widgetConfig: ComputedRef<WidgetConfig>;
    options: ComputedRef<WidgetOptions>;
    settings: ComputedRef<DashboardSettings|undefined>;
    consoleFilters: ComputedRef<ConsoleFilter[]>;
    granularity: ComputedRef<Granularity|undefined>;
    chartType: ComputedRef<ChartType|undefined>;
    groupBy: ComputedRef<CostGroupBy | AssetGroupBy | undefined>;
}
export function useWidgetBaseState(
    props: WidgetProps,
) {
    const optionsErrorMap = computed(() => getWidgetInheritOptionsErrorMap(
        props.inheritOptions,
        state.widgetConfig?.options_schema?.schema,
        props.dashboardVariablesSchema,
    ));

    const state = reactive<WidgetBaseState>({
        widgetConfig: computed<WidgetConfig>(() => getWidgetConfig(props.widgetConfigId)),
        options: computed<WidgetOptions>(() => getRefinedOptions(
            state.widgetConfig.options,
            props.options,
            props.inheritOptions,
            props.dashboardVariables,
            optionsErrorMap.value,
        )),
        settings: computed<DashboardSettings|undefined>(() => (props.dashboardSettings ? {
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
        } : undefined)),
        consoleFilters: computed<WidgetFilter[]>(() => {
            if (!state.options?.filters || isEmpty(state.options.filters)) return [];
            return flattenDeep<WidgetFilter[]>(Object.values(state.options.filters));
        }),
        granularity: computed(() => state.options?.granularity),
        chartType: computed<ChartType|undefined>(() => state.options?.chart_type),
        groupBy: computed(() => {
            if (state.widgetConfig.labels?.includes('Cost')) return state.options?.cost_group_by;
            if (state.widgetConfig.labels?.includes('Asset')) return state.options?.asset_group_by;
            return undefined;
        }),
    }) as UnwrapRef<WidgetBaseState>;

    return state;
}


const getRefinedOptions = (
    configOptions?: WidgetOptions,
    optionsData?: WidgetOptions,
    inheritOptions?: InheritOptions,
    dashboardVariables?: DashboardVariables,
    optionsErrorMap?: InheritOptionsErrorMap,
): WidgetOptions => {
    const mergedOptions = merge({}, configOptions, optionsData);
    if (!inheritOptions || !dashboardVariables) return mergedOptions;

    const parentOptions: Partial<WidgetOptions> = convertInheritOptionsToWidgetFiltersMap(inheritOptions, dashboardVariables, optionsErrorMap);
    const refined = merge({}, mergedOptions, parentOptions);
    return refined;
};

const convertInheritOptionsToWidgetFiltersMap = (
    inheritOptions: InheritOptions,
    dashboardVariables: DashboardVariables,
    optionsErrorMap?: InheritOptionsErrorMap,
): Partial<WidgetOptions> => {
    const result: Partial<WidgetOptions> = {
        filters: {},
    };
    Object.entries(inheritOptions).forEach(([filterKey, inheritOption]) => {
        if (optionsErrorMap?.[filterKey]) return;

        const variableKey = inheritOption?.variable_info?.key;
        if (!inheritOption?.enabled || !variableKey) return;

        const variableValue = dashboardVariables[variableKey];
        if (!variableValue || !variableValue?.length) return;

        if (filterKey.startsWith('filters.')) {
            const _filterKey = filterKey.replace('filters.', '');
            const filterDataKey = getWidgetFilterDataKey(_filterKey);
            result.filters = {
                ...result.filters,
                [_filterKey]: [{ k: filterDataKey, v: variableValue, o: '=' }],
            };
        } else {
            result[filterKey] = variableValue;
        }
    });
    return result;
};
