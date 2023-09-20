import { cloneDeep, flattenDeep } from 'lodash';
import { defineStore } from 'pinia';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type {
    DashboardLayoutWidgetInfo,
    InheritOptions, WidgetConfig,
    WidgetOptions,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetFilterDataKey } from '@/services/dashboards/widgets/_helpers/widget-filters-helper';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';
import { useMergedWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget/use-merged-widget-state';

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

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

export const useWidgetFormStore = defineStore('widget-form', {
    state: () => ({
        widgetConfigId: undefined as string|undefined, // widget config name that is used to get widget config
        widgetKey: undefined as string|undefined, // widget key to find widget in dashboard layout
        //
        widgetTitle: '',
        inheritOptions: {} as InheritOptions,
        widgetOptions: {} as WidgetOptions,
        schemaProperties: [] as string[],
        //
        isValid: false, // schema validation result
    }),
    getters: {
        widgetConfig(): WidgetConfig|undefined {
            return this.widgetConfigId ? getWidgetConfig(this.widgetConfigId) : undefined;
        },
        originWidgetInfo(): DashboardLayoutWidgetInfo|undefined {
            if (!this.widgetKey) return undefined;
            const _dashboardWidgetInfoList = flattenDeep(dashboardDetailState.dashboardWidgetInfoList ?? []);
            return _dashboardWidgetInfoList.find((w) => w.widget_key === this.widgetKey);
        },
        mergedWidgetInfo(): PartialDashboardLayoutWidgetInfo|undefined {
            if (!this.widgetConfigId) return undefined;
            const widgetInfo = this.originWidgetInfo;

            const mergedWidgetState = useMergedWidgetState({
                inheritOptions: widgetInfo?.inherit_options,
                widgetOptions: widgetInfo?.widget_options,
                widgetName: this.widgetConfigId,
                dashboardSettings: dashboardDetailState.settings,
                dashboardVariablesSchema: dashboardDetailState.variablesSchema,
                dashboardVariables: dashboardDetailState.variables,
                title: widgetInfo?.title,
            });

            // refine inheritOptions
            const projectId = dashboardDetailState.projectId;
            const refinedInheritOptions = projectId ? getProjectCaseInheritOptions(mergedWidgetState.inheritOptions) : mergedWidgetState.inheritOptions;

            return {
                ...(widgetInfo ?? {}),
                widget_key: this.widgetKey,
                widget_name: this.widgetConfigId,
                version: widgetInfo?.version ?? '1',
                title: mergedWidgetState.title,
                inherit_options: refinedInheritOptions,
                widget_options: mergedWidgetState.options,
                schema_properties: mergedWidgetState.schemaProperties,
            };
        },
    },
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
        initWidgetForm(widgetKey: string|undefined, widgetConfigId: string) {
            this.widgetKey = widgetKey;
            this.widgetConfigId = widgetConfigId;
            const widgetInfo = this.mergedWidgetInfo;
            if (!widgetInfo) return;

            this.widgetTitle = widgetInfo.title ?? '';
            this.widgetOptions = widgetInfo.widget_options ?? {};
            this.inheritOptions = widgetInfo.inherit_options ?? {};
            this.schemaProperties = widgetInfo.schema_properties ?? [];
        },
    },
});

const getProjectCaseInheritOptions = (inheritOptions: InheritOptions): InheritOptions => ({
    ...inheritOptions,
    [`filters.${REFERENCE_TYPE_INFO.project.type}`]: {
        enabled: true,
    },
});
