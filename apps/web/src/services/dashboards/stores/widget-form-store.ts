import type { ComputedRef, UnwrapRef } from 'vue';
import { computed, reactive } from 'vue';

import { flattenDeep, union } from 'lodash';
import { defineStore } from 'pinia';

import type { DashboardLayoutWidgetInfo } from '@/schema/dashboard/_types/dashboard-type';
import type {
    InheritOption,
    InheritOptions,
    WidgetConfig,
    WidgetOptions,
    WidgetOptionsSchemaProperty,
} from '@/schema/dashboard/_types/widget-type';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import {
    useWidgetTitleInput,
} from '@/services/dashboards/composables/use-widget-title-input';
import { getUpdatedWidgetInfo } from '@/services/dashboards/helpers/dashboard-widget-info-helper';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';
import type {
    MergedBaseWidgetState,
} from '@/services/dashboards/widgets/_composables/use-widget/merge-base-widget-state';
import {
    mergeBaseWidgetState,
} from '@/services/dashboards/widgets/_composables/use-widget/merge-base-widget-state';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_helpers/widget-options-schema-generator';
import type { UpdatableWidgetInfo } from '@/services/dashboards/widgets/_types/widget-type';


/* Description
    * This store is used to get/manage 'a' widget data.
    * This store is used in
    *   1) widget view modal (in dashboard detail page)
    *   2) widget edit modal (in dashboard customize page)
* */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface PartialDashboardLayoutWidgetInfo extends DashboardLayoutWidgetInfo {
    widget_key?: string;
}

interface Getters {
    widgetConfig: ComputedRef<WidgetConfig|undefined>;
    mergedWidgetInfo: ComputedRef<PartialDashboardLayoutWidgetInfo|undefined>;
    updatedWidgetInfo: ComputedRef<UpdatableWidgetInfo|undefined>;
    title: ComputedRef<string>;
    isTitleValid: ComputedRef<boolean|undefined>;
    titleInvalidText: ComputedRef<string|undefined>;
    isOptionsValid: ComputedRef<boolean>;
    isAllValid: ComputedRef<boolean>;
    isAllOptionsInitiated: ComputedRef<boolean>;
    globalOptionInfo: ComputedRef<GlobalOptionInfo|undefined>;
}

interface GlobalOptionInfo {
    optionKey: string;
    variableKey: string;
    name: string;
    value?: any;
    initiated?: boolean;
    initiatedAndHasValue?: boolean;
}
export const useWidgetFormStore = defineStore('widget-form', () => {
    const appContextStore = useAppContextStore();
    const appContextGetters = appContextStore.getters;
    const dashboardDetailStore = useDashboardDetailInfoStore();
    const dashboardDetailState = dashboardDetailStore.state;
    const dashboardDetailGetters = dashboardDetailStore.getters;
    const {
        title, resetTitle, updateTitle, isTitleValid, titleInvalidText,
    } = useWidgetTitleInput();

    const initialState = {
        widgetConfigId: undefined as string|undefined, // widget config name that is used to get widget config
        widgetKey: undefined as string|undefined, // widget key to find widget in dashboard layout
        //
        inheritOptions: {} as InheritOptions,
        widgetOptions: {} as WidgetOptions,
        schemaProperties: [] as string[],
        //
        optionsValidMap: {} as Record<string, boolean>,
        optionsInitMap: {} as Record<string, boolean>,
    };

    const state = reactive(initialState);

    const dashboardWidgetInfo = computed<DashboardLayoutWidgetInfo|undefined>(() => {
        if (!state.widgetKey) return undefined;
        const _dashboardWidgetInfoList = flattenDeep(dashboardDetailState.dashboardWidgetInfoList ?? []);
        return _dashboardWidgetInfoList.find((w) => w.widget_key === state.widgetKey);
    });
    const dashboardScope = computed<DashboardScope>(() => {
        if (appContextGetters.isAdminMode) return 'DOMAIN';

        // update case
        if (dashboardDetailState.dashboardInfo) {
            return dashboardDetailState.dashboardInfo.resource_group;
        }

        // create case
        return dashboardDetailState.dashboardScope;
    });
    const mergedWidgetState = computed<UnwrapRef<MergedBaseWidgetState>|undefined>(() => {
        if (!state.widgetConfigId) return undefined;
        const merged = mergeBaseWidgetState({
            inheritOptions: dashboardWidgetInfo.value?.inherit_options,
            widgetOptions: dashboardWidgetInfo.value?.widget_options,
            widgetName: state.widgetConfigId,
            dashboardSettings: dashboardDetailState.settings,
            dashboardVariablesSchema: dashboardDetailGetters.refinedVariablesSchema,
            dashboardVariables: dashboardDetailState.variables,
            title: dashboardWidgetInfo.value?.title,
            schemaProperties: dashboardWidgetInfo.value?.schema_properties,
        });
        const refined = {
            ...merged,
            widgetConfig: getWidgetConfigByDashboardScope(merged.widgetConfig, dashboardScope.value),
            inheritOptions: getInheritOptionsByDashboardScope(merged.inheritOptions, dashboardScope.value),
            schemaProperties: getSchemaPropertiesByDashboardScope(merged.schemaProperties, dashboardScope.value),
        };
        return refined;
    });

    const getters: UnwrapRef<Getters> = reactive({
        widgetConfig: computed<WidgetConfig|undefined>(() => mergedWidgetState.value?.widgetConfig),
        //
        mergedWidgetInfo: computed<PartialDashboardLayoutWidgetInfo|undefined>(() => {
            if (!state.widgetConfigId) return undefined;

            return {
                ...(dashboardWidgetInfo.value ?? {}),
                widget_key: state.widgetKey,
                widget_name: state.widgetConfigId,
                version: dashboardWidgetInfo.value?.version ?? '1',
                title: mergedWidgetState.value?.title,
                inherit_options: mergedWidgetState.value?.inheritOptions,
                widget_options: mergedWidgetState.value?.options,
                schema_properties: mergedWidgetState.value?.schemaProperties,
            };
        }),
        updatedWidgetInfo: computed<UpdatableWidgetInfo|undefined>(() => {
            if (!getters.widgetConfig || !state.widgetConfigId) {
                return undefined;
            }

            return getUpdatedWidgetInfo(getters.widgetConfig, {
                title: getters.title,
                inherit_options: state.inheritOptions,
                widget_options: state.widgetOptions,
                schema_properties: state.schemaProperties,
            });
        }),
        //
        title,
        isTitleValid,
        titleInvalidText: titleInvalidText as ComputedRef<string|undefined>,
        isOptionsValid: computed<boolean>(() => Object.values(state.optionsValidMap).every((valid) => valid)),
        isAllValid: computed<boolean>(() => !!(getters.isOptionsValid && getters.isTitleValid)),
        //
        isAllOptionsInitiated: computed<boolean>(() => state.schemaProperties.every((name) => state.optionsInitMap[name])),
        globalOptionInfo: computed<GlobalOptionInfo|undefined>(() => {
            const properties = getters.widgetConfig?.options_schema?.properties;
            if (!properties) return undefined;

            const found = Object.entries(properties).find(([, property]) => (property as WidgetOptionsSchemaProperty).scope === 'GLOBAL');
            if (!found) return undefined;

            const [optionKey, schema] = found;
            const name = schema.name as string;
            const variableKey = schema.key as string;

            // inherit case
            const inheritOption: InheritOption|undefined = state.inheritOptions[optionKey];
            if (inheritOption?.enabled) {
                if (!inheritOption.variable_key) return undefined;
                const value = dashboardDetailState.variables?.[inheritOption.variable_key];
                return {
                    optionKey,
                    variableKey,
                    name,
                    value,
                    initiated: state.optionsInitMap[optionKey],
                    initiatedAndHasValue: state.optionsInitMap[optionKey] && (Array.isArray(value) ? value.length > 0 : !!value),
                };
            }
            // normal case
            const value = state.widgetOptions[optionKey];
            return {
                optionKey,
                variableKey,
                name,
                value,
                initiated: state.optionsInitMap[optionKey],
                initiatedAndHasValue: state.optionsInitMap[optionKey] && (Array.isArray(value) ? value.length > 0 : !!value),
            };
        }),
    });

    const initOptionsValidMap = () => {
        const optionsValidMap = {};
        state.schemaProperties.forEach((name) => {
            optionsValidMap[name] = true;
        });
        state.optionsValidMap = optionsValidMap;
    };
    const initOptionsInitMap = (exceptGlobalOption ?: boolean) => {
        const optionsInitMap = {};
        state.schemaProperties.forEach((name) => {
            optionsInitMap[name] = false;
        });
        const globalOptionKey = getters.globalOptionInfo?.optionKey;
        if (exceptGlobalOption && globalOptionKey) {
            optionsInitMap[globalOptionKey] = state.optionsInitMap[globalOptionKey];
        }
        state.optionsInitMap = optionsInitMap;
    };

    const actions = {
        resetTitle,
        updateTitle,
        updateOptionsValidMap(optionsValidMap: Record<string, boolean>) {
            state.optionsValidMap = optionsValidMap;
        },
        updateOptionValidState(optionKey: string, isValid: boolean) {
            state.optionsValidMap = {
                ...state.optionsValidMap,
                [optionKey]: isValid,
            };
        },
        updateOptionInitState(optionKey: string, isInit: boolean) {
            state.optionsInitMap = {
                ...state.optionsInitMap,
                [optionKey]: isInit,
            };
        },
        resetOptionsInitMap(exceptGlobalOption = false) {
            initOptionsInitMap(exceptGlobalOption);
        },
        updateOptions(options: WidgetOptions) {
            state.widgetOptions = options;
        },
        resetAll() {
            Object.entries(initialState).forEach(([key, val]) => {
                state[key] = val;
            });
            resetTitle();
        },
        initWidgetForm(widgetKey: string|undefined, widgetConfigId: string) {
            state.widgetKey = widgetKey;
            state.widgetConfigId = widgetConfigId;
            const widgetInfo = getters.mergedWidgetInfo;

            updateTitle(widgetInfo?.title ?? '');
            state.widgetOptions = widgetInfo?.widget_options ?? {};
            state.inheritOptions = widgetInfo?.inherit_options ?? {};
            state.schemaProperties = widgetInfo?.schema_properties ?? [];

            initOptionsValidMap();
            initOptionsInitMap();
        },
        updateInheritOption(propertyName: string, enabled: boolean, variableKey?: string) {
            const inheritOptions = { ...state.inheritOptions };
            if (enabled) {
                inheritOptions[propertyName] = {
                    enabled: true,
                    variable_key: variableKey ?? getters.widgetConfig?.options_schema?.properties?.[propertyName]?.key,
                };
            } else {
                inheritOptions[propertyName] = {
                    enabled: false,
                };
            }
            state.inheritOptions = inheritOptions;
        },
        updateSchemaProperties(properties: string[]) {
            state.schemaProperties = properties;

            // update inherit options
            const inheritOptions = { ...state.inheritOptions };
            Object.keys(inheritOptions).forEach((name) => {
                if (!properties.includes(name)) delete inheritOptions[name];
            });
            state.inheritOptions = inheritOptions;

            // update widget options
            // const widgetOptions = cloneDeep(state.widgetOptions);
            // Object.keys(widgetOptions).forEach((name) => {
            //     if (!properties.includes(name)) delete widgetOptions[name];
            // });
            // state.widgetOptions = widgetOptions;

            initOptionsValidMap();
            initOptionsInitMap();
        },
        returnToInitialSettings() {
            updateTitle(getters.mergedWidgetInfo?.title ?? '');
            state.widgetOptions = getters.mergedWidgetInfo?.widget_options ?? {};
            state.schemaProperties = getters.mergedWidgetInfo?.schema_properties ?? [];
            state.inheritOptions = getters.mergedWidgetInfo?.inherit_options ?? {};

            initOptionsValidMap();
            initOptionsInitMap();
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});




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
        const extraOptionsSchema = getWidgetOptionsSchema([['filters.project', { fixed: true, readonly: true }]]);
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

