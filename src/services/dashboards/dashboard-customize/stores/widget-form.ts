import { reactive } from 'vue';

import { cloneDeep } from 'lodash';
import { defineStore } from 'pinia';

import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import type { DashboardLayoutWidgetInfo, InheritOptions, WidgetOptions } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';


interface State {
    widgetConfigId?: string;
    widgetTitle?: string;
    isValid: boolean;
    inheritOptions?: InheritOptions;
    widgetOptions?: WidgetOptions;
    widgetInfo?: DashboardLayoutWidgetInfo;
    defaultSchemaProperties?: string[];
}

export const useWidgetFormStore = defineStore('widget-form', () => {
    const dashboardDetailInfoStore = useDashboardDetailInfoStore();

    const state = reactive<State>({
        widgetConfigId: undefined,
        widgetTitle: undefined,
        isValid: false,
        inheritOptions: undefined,
        widgetOptions: undefined,
        widgetInfo: undefined,
        defaultSchemaProperties: undefined,
    });
    const setFormData = (formData: any) => {
        if (!state.widgetConfigId) return;
        const widgetConfig = getWidgetConfig(state.widgetConfigId);
        const widgetOptions: WidgetOptions = {
            ...widgetConfig.options,
        };
        const widgetFiltersMap: WidgetOptions['filters'] = {};
        const _inheritOptions = cloneDeep(state.inheritOptions);
        Object.entries(formData).forEach(([key, val]) => {
            const _propertyName = key.replace('filters.', '');
            if (_inheritOptions?.[key]?.enabled && val) {
                _inheritOptions[key] = {
                    enabled: true,
                    variable_info: {
                        key: val as string,
                    },
                };
            } else if (key.startsWith('filters.')) {
                if (val) widgetFiltersMap[_propertyName] = [{ k: _propertyName, v: val, o: '=' }];
            } else {
                widgetOptions[key] = val;
            }
        });
        widgetOptions.filters = widgetFiltersMap;

        state.widgetOptions = widgetOptions;
    };

    const initWidgetForm = (widgetKey: string): DashboardLayoutWidgetInfo|undefined => {
        state.widgetInfo = dashboardDetailInfoStore.dashboardWidgetInfoList.find((w) => w.widget_key === widgetKey);
        if (state.widgetInfo) {
            state.widgetConfigId = state.widgetInfo.widget_name;
            state.widgetTitle = state.widgetInfo.title;
            state.widgetOptions = state.widgetInfo.widget_options;
            state.inheritOptions = state.widgetInfo.inherit_options;
            state.defaultSchemaProperties = state.widgetInfo.default_schema_properties;
        }
        return state.widgetInfo;
    };

    return {
        state,
        setFormData,
        initWidgetForm,
    };
});
