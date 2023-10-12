import { cloneDeep, flattenDeep } from 'lodash';
import { defineStore } from 'pinia';

import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type { DashboardLayoutWidgetInfo, InheritOptions, WidgetOptions } from '@/services/dashboards/widgets/_configs/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/_configs/view-config';
import { getWidgetFilterDataKey } from '@/services/dashboards/widgets/_helpers/widget-filters-helper';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';

/* Description
    * This store is used to get/manage 'a' widget data.
    * This store is used in
    *   1) widget view modal (in dashboard detail page)
    *   2) widget edit modal (in dashboard customize page)
* */

interface WidgetFormState {
    widgetConfigId?: string;
    widgetTitle?: string;
    isValid: boolean;
    inheritOptions?: InheritOptions;
    widgetOptions?: WidgetOptions;
    widgetInfo?: DashboardLayoutWidgetInfo;
    schemaProperties?: string[];
    // view modal
    widgetKey?: string;
    theme?: WidgetTheme;
}
interface WidgetFormActions {
    setFormData: (formData: any) => void;
    initWidgetForm: (widgetKey: string) => DashboardLayoutWidgetInfo|undefined;
}

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

export const useWidgetFormStore = defineStore<string, WidgetFormState, any, WidgetFormActions>('widget-form', {
    state: () => ({
        widgetConfigId: undefined,
        widgetTitle: undefined,
        isValid: false,
        inheritOptions: undefined,
        widgetOptions: undefined,
        widgetInfo: undefined,
        schemaProperties: undefined,
    }),
    actions: {
        setFormData(formData: any) {
            if (!this.widgetConfigId) return;
            const widgetConfig = getWidgetConfig(this.widgetConfigId);
            const _widgetOptions: WidgetOptions = {
                ...widgetConfig.options,
            };
            const widgetFiltersMap: WidgetOptions['filters'] = {};
            const _inheritOptions = cloneDeep(this.inheritOptions);
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
                    if (val) {
                        const filterDataKey = getWidgetFilterDataKey(_propertyName);
                        widgetFiltersMap[_propertyName] = [{ k: filterDataKey, v: val, o: '=' }];
                    }
                } else {
                    _widgetOptions[key] = val;
                }
            });
            _widgetOptions.filters = widgetFiltersMap;

            this.widgetOptions = _widgetOptions;
            this.inheritOptions = _inheritOptions;
        },
        initWidgetForm(widgetKey: string) {
            const _dashboardWidgetInfoList = flattenDeep(dashboardDetailState.dashboardWidgetInfoList ?? []);
            this.widgetInfo = _dashboardWidgetInfoList.find((w) => w.widget_key === widgetKey);
            if (this.widgetInfo) {
                this.widgetConfigId = this.widgetInfo.widget_name;
                this.widgetTitle = this.widgetInfo.title;
                this.widgetOptions = this.widgetInfo.widget_options;
                this.inheritOptions = this.widgetInfo.inherit_options;
                this.schemaProperties = this.widgetInfo.schema_properties;
            }
            return this.widgetInfo;
        },
    },
});
