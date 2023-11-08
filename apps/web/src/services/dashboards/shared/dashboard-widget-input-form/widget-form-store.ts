import type { ComputedRef, UnwrapRef } from 'vue';
import { computed, reactive } from 'vue';

import {
    cloneDeep, flattenDeep,
} from 'lodash';
import { defineStore } from 'pinia';

import {
    useWidgetTitleInput,
} from '@/services/dashboards/shared/dashboard-widget-input-form/composables/use-widget-title-input';
import { getUpdatedWidgetInfo } from '@/services/dashboards/shared/helpers/dashboard-widget-info-helper';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type {
    DashboardLayoutWidgetInfo,
    InheritOptions, UpdatableWidgetInfo, WidgetConfig,
    WidgetOptions,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetFilterDataKey } from '@/services/dashboards/widgets/_helpers/widget-filters-helper';
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
    isAllValid: ComputedRef<boolean>;
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
        isOptionsValid: false,
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
        isAllValid: computed<boolean>(() => !!(state.isOptionsValid && getters.isTitleValid)),
    });

    const actions = {
        resetTitle,
        updateTitle,
        updateOptionsValid(isValid: boolean) {
            state.isOptionsValid = isValid;
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
        updateInheritOptionsAndWidgetOptionsByFormData(formData: any) {
            if (!getters.widgetConfig) return;
            const _widgetOptions: WidgetOptions = cloneDeep(getters.widgetConfig.options ?? {});
            const _widgetFilters: WidgetOptions['filters'] = {};
            const _inheritOptions = cloneDeep(state.inheritOptions);

            Object.entries(formData).forEach(([key, val]) => {
                // inherit widget option case
                if (_inheritOptions?.[key]?.enabled && val) {
                    _inheritOptions[key] = {
                        enabled: true,
                        variable_key: val as string,
                    };
                // widget option filters case
                } else if (key.startsWith('filters.')) {
                    if (val) {
                        const variableKey = getters.widgetConfig?.options_schema?.properties?.[key]?.key ?? '';
                        const filterDataKey = getWidgetFilterDataKey(variableKey);
                        _widgetFilters[variableKey] = [{ k: filterDataKey, v: val, o: '=' }];
                    }
                // other widget option case
                } else {
                    _widgetOptions[key] = val;
                }
            });

            _widgetOptions.filters = _widgetFilters;
            state.widgetOptions = _widgetOptions;
            state.inheritOptions = _inheritOptions;
        },
        initWidgetForm(widgetKey: string|undefined, widgetConfigId: string) {
            state.widgetKey = widgetKey;
            state.widgetConfigId = widgetConfigId;
            const widgetInfo = getters.mergedWidgetInfo;

            updateTitle(widgetInfo?.title ?? '');
            state.widgetOptions = widgetInfo?.widget_options ?? {};
            state.inheritOptions = widgetInfo?.inherit_options ?? {};
            state.schemaProperties = widgetInfo?.schema_properties ?? [];
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
