import { defineStore } from 'pinia';

import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/widget-helper';


interface State {
    widgetConfigId?: string;
    name?: string;
    isValid: boolean;
    formData?: DashboardLayoutWidgetInfo;
}
export const useWidgetFormStore = defineStore('form', {
    state: (): State => ({
        widgetConfigId: undefined,
        name: undefined,
        isValid: false,
        formData: undefined,
    }),
    actions: {
        setWidgetConfigId(val?: string): void {
            this.widgetConfigId = val;
        },
        setName(val?: string): void {
            this.name = val;
        },
        setIsValid(val: boolean): void {
            this.isValid = val;
        },
        setFormData(val?: DashboardLayoutWidgetInfo): void {
            this.formData = val;
        },
    },
    getters: {
        dashboardLayoutWidgetInfo: (state): DashboardLayoutWidgetInfo|undefined => {
            if (!state.widgetConfigId) return undefined;
            const widgetConfig = getWidgetConfig(state.widgetConfigId);
            return {
                widget_name: widgetConfig.widget_config_id,
                title: state.name,
                widget_options: {
                    ...widgetConfig.options,
                    // group_by: 'provider'
                },
                size: widgetConfig.sizes[0],
                version: '1', // 넣어야함??
                inherit_options: {},
                // inherit_options: {
                //     group_by: {
                //         enabled: true,
                //     },
                // },
            };
        },
    },
});
