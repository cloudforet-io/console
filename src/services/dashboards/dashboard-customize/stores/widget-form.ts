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
export const useWidgetFormStore = defineStore('form', {
    state: (): State => ({
        widgetConfigId: undefined,
        widgetTitle: undefined,
        isValid: false,
        inheritOptions: undefined,
        widgetOptions: undefined,
    }),
    actions: {
        setWidgetConfigId(val?: string) {
            this.widgetConfigId = val;
        },
        setWidgetTitle(val?: string) {
            this.widgetTitle = val;
        },
        setIsValid(val: boolean) {
            this.isValid = val;
        },
        setFormData(formData: any, inheritItemMap: Record<string, boolean>) {
            if (!this.widgetConfigId) return;
            const widgetConfig = getWidgetConfig(this.widgetConfigId);
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
                            widgetFiltersMap[_propertyName].push({ k: _propertyName, v, o: '' });
                        });
                    } else {
                        widgetFiltersMap[_propertyName].push({ k: _propertyName, v: val, o: '' });
                    }
                } else {
                    widgetOptions[_propertyName] = val;
                }
            });
            widgetOptions.filters = widgetFiltersMap;

            //
            this.widgetOptions = widgetOptions;
            this.inheritOptions = inheritOptions;
        },
    },
});
