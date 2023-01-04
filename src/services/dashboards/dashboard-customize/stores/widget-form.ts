import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { InheritOptions, WidgetOptions } from '@/services/dashboards/widgets/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/widget-helper';


interface State {
    widgetConfigId?: string;
    widgetTitle?: string;
    isValid: boolean;
    inheritOptions?: InheritOptions;
    widgetOptions?: WidgetOptions;
}

export const useWidgetFormStore = defineStore('widget-form', () => {
    const state = reactive<State>({
        widgetConfigId: undefined,
        widgetTitle: undefined,
        isValid: false,
        inheritOptions: undefined,
        widgetOptions: undefined,
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
                inheritOptions[_propertyName] = {
                    enabled: true,
                    variable_info: {
                        key: val as string,
                    },
                };
            } else if (key.startsWith('filters.')) {
                widgetFiltersMap[_propertyName] = [];
                if (Array.isArray(val)) {
                    val.forEach((v) => {
                        if (v) widgetFiltersMap[_propertyName].push({ k: _propertyName, v, o: '' });
                    });
                } else if (val) widgetFiltersMap[_propertyName].push({ k: _propertyName, v: val, o: '' });
            } else {
                widgetOptions[_propertyName] = val;
            }
        });
        widgetOptions.filters = widgetFiltersMap;

        //
        state.widgetOptions = widgetOptions;
        state.inheritOptions = inheritOptions;
    };

    return {
        state,
        setWidgetConfigId,
        setWidgetTitle,
        setIsValid,
        setFormData,
    };
});
