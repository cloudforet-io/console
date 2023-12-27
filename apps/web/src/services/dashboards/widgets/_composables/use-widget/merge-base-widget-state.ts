import type { ComputedRef, Ref, UnwrapRef } from 'vue';
import { computed, reactive } from 'vue';

import { union } from 'lodash';

import type {
    DashboardSettings,
    DashboardVariables,
    DashboardVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';
import type { InheritOptions, WidgetConfig, WidgetOptions } from '@/schema/dashboard/_types/widget-type';

import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-config-helper';
import { getInitialWidgetInheritOptions } from '@/services/dashboards/widgets/_helpers/widget-inherit-options-helper';
import {
    getRefinedWidgetOptions,
} from '@/services/dashboards/widgets/_helpers/widget-options-helper';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_helpers/widget-options-schema-generator';
import {
    getInitialSchemaProperties, getRefinedSchemaProperties,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';
import { getWidgetInheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';


export interface MergedBaseWidgetState {
    widgetConfig: ComputedRef<WidgetConfig>;
    options: ComputedRef<WidgetOptions>;
    settings: ComputedRef<DashboardSettings|undefined>;
    inheritOptions: ComputedRef<InheritOptions>;
    title: ComputedRef<string>;
    schemaProperties: ComputedRef<string[]>;
}
interface MergeBaseWidgetStateOptions {
    inheritOptions: InheritOptions|undefined|Ref<InheritOptions|undefined>; // inherit information from the dashboard widget layout info.
    widgetOptions: WidgetOptions|undefined|Ref<WidgetOptions|undefined>; // widget options from the dashboard widget layout info.
    widgetName: string|Ref<string>; // widget config name
    dashboardSettings: DashboardSettings|undefined|Ref<DashboardSettings|undefined>; // dashboard settings
    dashboardVariablesSchema: DashboardVariablesSchema|undefined|Ref<DashboardVariablesSchema|undefined>; // dashboard variables schema
    dashboardVariables: DashboardVariables|undefined|Ref<DashboardVariables|undefined>; // dashboard variables
    title?: string|Ref<string|undefined>; // widget title from the dashboard widget layout info.
    schemaProperties?: string[]|Ref<string[]|undefined>; // widget schema properties from the dashboard widget layout info.
    dashboardScope?: DashboardScope|Ref<DashboardScope|undefined>; // it is used for attaching extra options to the widget options, schema properties, and inherit options. default: 'WORKSPACE'
}
export function mergeBaseWidgetState(
    {
        inheritOptions, widgetOptions, widgetName, dashboardSettings, dashboardVariablesSchema, dashboardVariables, title, schemaProperties, dashboardScope,
    }: MergeBaseWidgetStateOptions,
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
        dashboardScope,
    });
    const optionsErrorMap = computed(() => getWidgetInheritOptionsErrorMap(
        optionState.schemaProperties ?? [],
        optionState.inheritOptions,
        state.widgetConfig?.options_schema,
        optionState.dashboardVariablesSchema,
    ));

    const state = reactive<MergedBaseWidgetState>({
        widgetConfig: computed<WidgetConfig>(() => {
            const config = getWidgetConfig(optionState.widgetName);
            return getWidgetConfigByDashboardScope(config, optionState.dashboardScope ?? 'WORKSPACE');
        }),
        options: computed<WidgetOptions>(() => getRefinedWidgetOptions(
            state.widgetConfig,
            optionState.widgetOptions,
            state.inheritOptions,
            optionState.dashboardVariables,
            optionsErrorMap.value,
        )),
        inheritOptions: computed<InheritOptions>(() => {
            const _inheritOptions = getInitialWidgetInheritOptions(state.widgetConfig, optionState.inheritOptions, optionState.dashboardVariablesSchema);
            return getInheritOptionsByDashboardScope(_inheritOptions, optionState.dashboardScope ?? 'WORKSPACE');
        }),
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
            const updatedSchemaProperties = getSchemaPropertiesByDashboardScope(initialSchemaProperties, optionState.dashboardScope ?? 'WORKSPACE');
            if (!optionState.schemaProperties) return updatedSchemaProperties;
            return getRefinedSchemaProperties(optionState.schemaProperties, updatedSchemaProperties, optionState.widgetOptions);
        }),
    }) as UnwrapRef<MergedBaseWidgetState>;

    return state;
}


const getWidgetConfigByDashboardScope = (config: WidgetConfig, dashboardScope: DashboardScope): WidgetConfig => {
    if (dashboardScope === 'DOMAIN') {
        const extraOptionsSchema = getWidgetOptionsSchema(['filters.workspace']);
        return {
            ...config,
            options_schema: {
                properties: { ...(config.options_schema?.properties ?? {}), ...extraOptionsSchema.properties },
                order: ['filters.workspace', ...(config.options_schema?.order ?? [])],
            },
        };
    }
    if (dashboardScope === 'PROJECT') {
        const extraOptionsSchema = getWidgetOptionsSchema([['filters.project', { fixed: true, optional: false, readonly: true }]]);
        return {
            ...config,
            options_schema: {
                properties: { ...(config.options_schema?.properties ?? {}), ...extraOptionsSchema.properties },
                order: ['filters.project', ...(config.options_schema?.order ?? [])],
            },
        };
    }
    return config;
};
const getInheritOptionsByDashboardScope = (inheritOptions: InheritOptions, dashboardScope: DashboardScope): InheritOptions => {
    if (dashboardScope === 'DOMAIN') {
        return { ...inheritOptions, 'filters.workspace': { enabled: true, variable_key: 'workspace' } };
    }
    if (dashboardScope === 'PROJECT') {
        return { ...inheritOptions, 'filters.project': { enabled: true, variable_key: 'project' } };
    }
    return inheritOptions;
};

const getSchemaPropertiesByDashboardScope = (schemaProperties: string[], dashboardScope: DashboardScope): string[] => {
    if (dashboardScope === 'DOMAIN') {
        return union(['filters.workspace'], schemaProperties);
    }
    if (dashboardScope === 'PROJECT') {
        return union(['filters.project'], schemaProperties);
    }
    return schemaProperties;
};




