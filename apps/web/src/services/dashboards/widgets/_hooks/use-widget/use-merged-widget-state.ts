import type { ComputedRef, Ref, UnwrapRef } from 'vue';
import {
    computed, reactive,
} from 'vue';

import type { DashboardSettings, DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import type {
    WidgetConfig, WidgetOptions,
    InheritOptions,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';
import { getInitialWidgetInheritOptions } from '@/services/dashboards/widgets/_helpers/widget-inherit-options-helper';
import {
    getRefinedWidgetOptions,
} from '@/services/dashboards/widgets/_helpers/widget-options-helper';
import {
    getInitialSchemaProperties, getRefinedSchemaProperties,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';
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
        state.widgetConfig?.options_schema,
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
        inheritOptions: computed<InheritOptions>(() => getInitialWidgetInheritOptions(state.widgetConfig, optionState.inheritOptions, optionState.dashboardVariablesSchema)),
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
        schemaProperties: computed<string[]>(() => {
            const initialSchemaProperties = getInitialSchemaProperties(state.widgetConfig, optionState.dashboardVariablesSchema);
            if (!optionState.schemaProperties) return initialSchemaProperties;
            return getRefinedSchemaProperties(optionState.schemaProperties, initialSchemaProperties, optionState.widgetOptions);
        }),
    }) as UnwrapRef<MergedWidgetState>;

    return state;
}






