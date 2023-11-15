import type { ComputedRef, UnwrapRef } from 'vue';
import { computed, reactive } from 'vue';

import {
    flattenDeep,
} from 'lodash';
import { defineStore } from 'pinia';

import {
    useWidgetTitleInput,
} from '@/services/dashboards/shared/dashboard-widget-input-form/composables/use-widget-title-input';
import { getUpdatedWidgetInfo } from '@/services/dashboards/shared/helpers/dashboard-widget-info-helper';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type {
    DashboardLayoutWidgetInfo, InheritOption,
    InheritOptions, UpdatableWidgetInfo, WidgetConfig,
    WidgetOptions,
} from '@/services/dashboards/widgets/_configs/config';
import type { WidgetOptionsSchemaProperty } from '@/services/dashboards/widgets/_configs/widget-options-schema';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';
import { mergeBaseWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget/merge-base-widget-state';

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
    originWidgetInfo: ComputedRef<DashboardLayoutWidgetInfo|undefined>;
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
    const dashboardDetailStore = useDashboardDetailInfoStore();
    const dashboardDetailState = dashboardDetailStore.$state;
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

    const getters: UnwrapRef<Getters> = reactive({
        widgetConfig: computed<WidgetConfig|undefined>(() => (state.widgetConfigId ? getWidgetConfig(state.widgetConfigId) : undefined)),
        //
        originWidgetInfo: computed<DashboardLayoutWidgetInfo|undefined>(() => {
            if (!state.widgetKey) return undefined;
            const _dashboardWidgetInfoList = flattenDeep(dashboardDetailState.dashboardWidgetInfoList ?? []);
            return _dashboardWidgetInfoList.find((w) => w.widget_key === state.widgetKey);
        }),
        mergedWidgetInfo: computed<PartialDashboardLayoutWidgetInfo|undefined>(() => {
            if (!state.widgetConfigId) return undefined;
            const widgetInfo = getters.originWidgetInfo;

            const mergedWidgetState = mergeBaseWidgetState({
                inheritOptions: widgetInfo?.inherit_options,
                widgetOptions: widgetInfo?.widget_options,
                widgetName: state.widgetConfigId,
                dashboardSettings: dashboardDetailState.settings,
                dashboardVariablesSchema: dashboardDetailState.variablesSchema,
                dashboardVariables: dashboardDetailState.variables,
                title: widgetInfo?.title,
                schemaProperties: widgetInfo?.schema_properties,
            });

            // refine inheritOptions to make inherit project variable from dashboard if it is project dashboard.
            const projectId = dashboardDetailState.projectId;
            const refinedInheritOptions = projectId ? getProjectCaseInheritOptions(mergedWidgetState.inheritOptions) : mergedWidgetState.inheritOptions;

            return {
                ...(widgetInfo ?? {}),
                widget_key: state.widgetKey,
                widget_name: state.widgetConfigId,
                version: widgetInfo?.version ?? '1',
                title: mergedWidgetState.title,
                inherit_options: refinedInheritOptions,
                widget_options: mergedWidgetState.options,
                schema_properties: mergedWidgetState.schemaProperties,
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
            const widgetOptions = { ...state.widgetOptions };
            Object.keys(widgetOptions).forEach((name) => {
                if (!properties.includes(name)) delete widgetOptions[name];
            });
            state.widgetOptions = widgetOptions;

            initOptionsValidMap();
            initOptionsInitMap();
        },
        returnToInitialSettings() {
            const mergedWidgetState = mergeBaseWidgetState({
                inheritOptions: getters.originWidgetInfo?.inherit_options,
                widgetOptions: getters.originWidgetInfo?.widget_options,
                widgetName: getters.originWidgetInfo?.widget_name ?? '',
                dashboardSettings: dashboardDetailState.settings,
                dashboardVariablesSchema: dashboardDetailState.variablesSchema,
                dashboardVariables: dashboardDetailState.variables,
                title: getters.originWidgetInfo?.title,
                schemaProperties: getters.originWidgetInfo?.schema_properties,
            });
            updateTitle(mergedWidgetState.title ?? '');
            state.widgetOptions = mergedWidgetState.options ?? {};
            state.schemaProperties = mergedWidgetState.schemaProperties ?? [];
            state.inheritOptions = mergedWidgetState.inheritOptions ?? {};

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

const getProjectCaseInheritOptions = (inheritOptions: InheritOptions): InheritOptions => ({
    ...inheritOptions,
    'filters.project': {
        enabled: true,
    },
});
