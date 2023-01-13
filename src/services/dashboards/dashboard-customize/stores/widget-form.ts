import { reactive } from 'vue';

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
    });
    const setWidgetConfigId = (val?: string) => {
        state.widgetConfigId = val;
    };
    const setWidgetTitle = (val?: string) => {
        state.widgetTitle = val;
    };
    const setIsValid = (val: boolean) => {
        state.isValid = val;
    };
    const setFormData = (formData: any, inheritItemMap: Record<string, boolean>) => {
        if (!state.widgetConfigId) return;
        const widgetConfig = getWidgetConfig(state.widgetConfigId);
        const widgetOptions: WidgetOptions = {
            ...widgetConfig.options,
        };
        const widgetFiltersMap: WidgetOptions['filters'] = {};
        const inheritOptions: InheritOptions = {};
        Object.entries(formData).forEach(([key, val]) => {
            const _propertyName = key.replace('filters.', '');
            if (inheritItemMap[key]) {
                if (!val) return;
                inheritOptions[key] = {
                    enabled: true,
                    variable_info: {
                        key: val as string,
                    },
                };
            } else if (key.startsWith('filters.')) {
                widgetFiltersMap[_propertyName] = [{ k: _propertyName, v: val, o: '=' }];
            } else {
                widgetOptions[key] = val;
            }
        });
        widgetOptions.filters = widgetFiltersMap;

        //
        state.widgetOptions = widgetOptions;
        state.inheritOptions = inheritOptions;
    };

    const initWidgetForm = (widgetKey: string) => {
        state.widgetInfo = dashboardDetailInfoStore.dashboardWidgetInfoList.find((w) => w.widget_key === widgetKey);
    };

    return {
        state,
        setWidgetConfigId,
        setWidgetTitle,
        setIsValid,
        setFormData,
        initWidgetForm,
    };
});
