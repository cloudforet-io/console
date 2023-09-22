import type { ComputedRef, Ref, UnwrapRef } from 'vue';
import {
    computed, reactive,
} from 'vue';

import { merge } from 'lodash';

import type { DashboardSettings, DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import type {
    WidgetConfig, WidgetOptions,
    InheritOptions,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetFilterDataKey } from '@/services/dashboards/widgets/_helpers/widget-filters-helper';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';
import {
    getInitialSchemaProperties,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';
import type { InheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';
import { getWidgetInheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';


export interface MergedWidgetState {
    widgetConfig: ComputedRef<WidgetConfig>;
    options: ComputedRef<WidgetOptions>;
    settings: ComputedRef<DashboardSettings|undefined>;
    inheritOptions: ComputedRef<InheritOptions>;
    title: ComputedRef<string>;
    schemaProperties: ComputedRef<string[]>;
}
interface UseMergedWidgetStateOptions {
    inheritOptions: InheritOptions|undefined|Ref<InheritOptions|undefined>; // inherit information from the dashboard widget layout info.
    widgetOptions: WidgetOptions|undefined|Ref<WidgetOptions|undefined>; // widget options from the dashboard widget layout info.
    widgetName: string|Ref<string>; // widget config name
    dashboardSettings: DashboardSettings|undefined|Ref<DashboardSettings|undefined>; // dashboard settings
    dashboardVariablesSchema: DashboardVariablesSchema|undefined|Ref<DashboardVariablesSchema|undefined>; // dashboard variables schema
    dashboardVariables: DashboardVariables|undefined|Ref<DashboardVariables|undefined>; // dashboard variables
    title?: string|Ref<string|undefined>; // widget title from the dashboard widget layout info.
    schemaProperties?: string[]|Ref<string[]|undefined>; // widget schema properties from the dashboard widget layout info.
}
export function useMergedWidgetState(
    {
        inheritOptions, widgetOptions, widgetName, dashboardSettings, dashboardVariablesSchema, dashboardVariables, title, schemaProperties,
    }: UseMergedWidgetStateOptions,
) {
    const optionState = reactive({
        inheritOptions,
        widgetOptions,
        widgetName,
        dashboardSettings,
        dashboardVariablesSchema,
        dashboardVariables,
        title,
        schemaProperties,
    });
    const optionsErrorMap = computed(() => getWidgetInheritOptionsErrorMap(
        optionState.schemaProperties ?? [],
        optionState.inheritOptions,
        state.widgetConfig?.options_schema?.schema,
        optionState.dashboardVariablesSchema,
    ));

    const state = reactive<MergedWidgetState>({
        widgetConfig: computed<WidgetConfig>(() => getWidgetConfig(optionState.widgetName)),
        options: computed<WidgetOptions>(() => getRefinedWidgetOptions(
            state.widgetConfig,
            optionState.widgetOptions,
            state.inheritOptions,
            optionState.dashboardVariables,
            optionsErrorMap.value,
        )),
        inheritOptions: computed<InheritOptions>(() => getMergedWidgetInheritOptions(state.widgetConfig, optionState.inheritOptions)),
        settings: computed<DashboardSettings|undefined>(() => {
            if (!optionState.dashboardSettings) return undefined;
            const dateRange = optionState.dashboardSettings.date_range;
            return {
                date_range: dateRange ? {
                    enabled: dateRange.enabled ?? false,
                    start: dateRange.start,
                    end: dateRange.end,
                } : { enabled: false },
                refresh_interval_option: optionState.dashboardSettings.refresh_interval_option ?? 'off',
            };
        }),
        title: computed<string>(() => optionState.title ?? state.widgetConfig?.title ?? ''),
        schemaProperties: computed<string[]>(() => optionState.schemaProperties ?? getInitialSchemaProperties(state.widgetConfig, optionState.dashboardVariablesSchema)),
    }) as UnwrapRef<MergedWidgetState>;

    return state;
}


const getRefinedWidgetOptions = (
    widgetConfig?: WidgetConfig,
    optionsData?: WidgetOptions,
    mergedInheritOptions?: InheritOptions,
    dashboardVariables?: DashboardVariables,
    optionsErrorMap?: InheritOptionsErrorMap,
): WidgetOptions => {
    const mergedOptions = getMergedWidgetOptions(widgetConfig, optionsData);
    if (!mergedInheritOptions || !dashboardVariables) return mergedOptions;

    const parentOptions: Partial<WidgetOptions> = getRefinedParentOptions(mergedInheritOptions, dashboardVariables, optionsErrorMap);
    const refined = merge({}, mergedOptions, parentOptions);
    return refined;
};

const getMergedWidgetOptions = (widgetConfig?: WidgetConfig, widgetOptions?: WidgetOptions) => merge({}, widgetConfig?.options ?? {}, widgetOptions);

const getMergedWidgetInheritOptions = (widgetConfig?: WidgetConfig, inheritOptionsData?: InheritOptions): InheritOptions => {
    const mergedInheritOptions = merge({}, widgetConfig?.inherit_options ?? {}, inheritOptionsData);
    Object.values(mergedInheritOptions).forEach((inheritOption) => {
        if (inheritOption.enabled === false && inheritOption.variable_info) {
            inheritOption.variable_info = undefined;
        }
    });
    return mergedInheritOptions;
};

const getRefinedParentOptions = (
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

