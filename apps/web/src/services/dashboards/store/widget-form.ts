import { cloneDeep, flattenDeep } from 'lodash';
import { defineStore } from 'pinia';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type {
    DashboardLayoutWidgetInfo,
    InheritOptions,
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

interface WidgetFormState {
    widgetConfigId?: string;
    widgetTitle?: string;
    isValid: boolean;
    inheritOptions?: InheritOptions;
    widgetOptions?: WidgetOptions;
    widgetInfo?: PartialDashboardLayoutWidgetInfo;
    schemaProperties?: string[];
    // view modal
    widgetKey?: string;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface PartialDashboardLayoutWidgetInfo extends DashboardLayoutWidgetInfo {
    widget_key?: string;
}

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

export const useWidgetFormStore = defineStore('widget-form', {
    state: (): WidgetFormState => ({
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
        initWidgetForm(widgetKey: string|undefined, widgetConfigId: string, projectId?: string): PartialDashboardLayoutWidgetInfo {
            const _dashboardWidgetInfoList = flattenDeep(dashboardDetailState.dashboardWidgetInfoList ?? []);
            const widgetInfo: DashboardLayoutWidgetInfo|undefined = _dashboardWidgetInfoList.find((w) => w.widget_key === widgetKey);

            const mergedWidgetState = useMergedWidgetState({
                inheritOptions: widgetInfo?.inherit_options,
                widgetOptions: widgetInfo?.widget_options,
                widgetName: widgetConfigId,
                dashboardSettings: dashboardDetailState.settings,
                dashboardVariablesSchema: dashboardDetailState.variablesSchema,
                dashboardVariables: dashboardDetailState.variables,
            });

            // refine inheritOptions
            const refinedInheritOptions = projectId ? getProjectCaseInheritOptions(mergedWidgetState.inheritOptions) : mergedWidgetState.inheritOptions;

            // set states
            this.widgetInfo = {
                ...(widgetInfo ?? {}),
                widget_key: widgetKey,
                widget_name: widgetConfigId,
                version: widgetInfo?.version ?? '1',
                title: mergedWidgetState.title,
                inherit_options: refinedInheritOptions,
                widget_options: mergedWidgetState.options,
                schema_properties: mergedWidgetState.schemaProperties,
            };
            this.widgetConfigId = widgetConfigId;
            this.widgetTitle = mergedWidgetState.title;
            this.widgetOptions = mergedWidgetState.options;
            this.inheritOptions = refinedInheritOptions;
            this.schemaProperties = mergedWidgetState.schemaProperties;

            return this.widgetInfo;
        },
    },
});

const getProjectCaseInheritOptions = (inheritOptions: InheritOptions): InheritOptions => ({
    ...inheritOptions,
    [`filters.${REFERENCE_TYPE_INFO.project.type}`]: {
        enabled: true,
    },
});
