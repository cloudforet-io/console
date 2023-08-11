import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { ASSET_REFERENCE_TYPE_INFO } from '@/lib/reference/asset-reference-config';
import { COST_REFERENCE_TYPE_INFO } from '@/lib/reference/cost-reference-config';
import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import type { DashboardLabel, DashboardVariablesSchema } from '@/services/dashboards/config';
import { DASHBOARD_LABEL } from '@/services/dashboards/config';
import { ERROR_CASE_WIDGET_INFO } from '@/services/dashboards/dashboard-create/modules/dashboard-templates/config';
import { managedDashboardVariablesSchema, managedVariablesPropertiesMap } from '@/services/dashboards/managed-variables-schema';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';
import { getWidgetDefaultInheritOptions } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


export const getDefaultWidgetFormData = (widgetId: string): Record<string, string> => {
    const widgetConfig = getWidgetConfig(widgetId);
    const fixedProperties: string[] = widgetConfig.options_schema?.fixed_properties ?? [];
    const defaultProperties: string[] = widgetConfig.options_schema?.default_properties?.filter((d) => !fixedProperties.includes(d)) ?? [];
    const schemaFormData = {};

    // set default value to fixed properties
    fixedProperties.forEach((propertyName) => {
        schemaFormData[propertyName] = widgetConfig?.options?.[propertyName];
    });
    // set default value to default properties
    defaultProperties.forEach((propertyName) => {
        schemaFormData[propertyName] = propertyName.replace('filters.', '');
    });

    return schemaFormData;
};

type WidgetTuple = [widgetId: string]|[widgetId: string, customInfo: Partial<DashboardLayoutWidgetInfo>];
export const getDashboardLayoutWidgetInfoList = (widgetList: WidgetTuple[]): DashboardLayoutWidgetInfo[] => widgetList.map(
    ([widgetId, customInfo]) => {
        try {
            const widgetConfig = getWidgetConfig(widgetId);
            const widgetConfigTitle = widgetConfig.title ?? widgetConfig.widget_config_id;
            const title = customInfo?.title ? (customInfo?.title ?? widgetConfigTitle) : widgetConfigTitle;
            const widgetOptions = () => {
                const defaultOptions = cloneDeep(widgetConfig.options);
                const customOptions = customInfo?.widget_options;
                if (customOptions && defaultOptions) {
                    Object.keys(customOptions).forEach((key) => {
                        defaultOptions[key] = customOptions[key];
                    });
                }
                return defaultOptions;
            };
            const widgetInfo: DashboardLayoutWidgetInfo = {
                widget_key: uuidv4(),
                widget_name: widgetConfig.widget_config_id,
                title,
                widget_options: widgetOptions() ?? {},
                size: widgetConfig.sizes[0],
                version: '1',
                inherit_options: getWidgetDefaultInheritOptions(widgetConfig),
                schema_properties: widgetConfig.options_schema?.default_properties ?? [],
            };
            return widgetInfo;
        } catch (e) {
            console.error(e);
            return ERROR_CASE_WIDGET_INFO;
        }
    },
);

export const getDashboardVariablesSchema = (label?: DashboardLabel): DashboardVariablesSchema => {
    const _managedVariablesSchema: DashboardVariablesSchema = cloneDeep(managedDashboardVariablesSchema);
    if (label === DASHBOARD_LABEL.ASSET) {
        managedVariablesPropertiesMap.forEach((value, key) => {
            if (Object.keys(ASSET_REFERENCE_TYPE_INFO).includes(key)) {
                _managedVariablesSchema.properties[key] = { ...value, use: true }; // set Asset variables to use
            }
        });
        // HACK: remove below code after backend is ready
        _managedVariablesSchema.properties[REFERENCE_TYPE_INFO.service_account.type].use = false;
    } else if (label === DASHBOARD_LABEL.COST) {
        managedVariablesPropertiesMap.forEach((value, key) => {
            if (Object.keys(COST_REFERENCE_TYPE_INFO).includes(key)) {
                _managedVariablesSchema.properties[key] = { ...value, use: true }; // set Cost variables to use
            }
        });
    }
    return _managedVariablesSchema;
};
