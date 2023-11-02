import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { ASSET_VARIABLE_TYPE_INFO } from '@/lib/reference/asset-reference-config';
import { COST_VARIABLE_TYPE_INFO } from '@/lib/reference/cost-reference-config';
import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import type { DashboardLabel, DashboardVariablesSchema } from '@/services/dashboards/config';
import { DASHBOARD_LABEL } from '@/services/dashboards/config';
import { ERROR_CASE_WIDGET_INFO } from '@/services/dashboards/dashboard-create/modules/dashboard-templates/config';
import { MANAGED_DASH_VAR_SCHEMA, managedVariablesPropertiesMap } from '@/services/dashboards/managed-variables-schema';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';

type WidgetTuple = [widgetId: string]|[widgetId: string, customInfo: Partial<Pick<DashboardLayoutWidgetInfo, 'title'|'widget_options'|'size'|'inherit_options'|'schema_properties'>>];
export const getDashboardLayoutWidgetInfoList = (widgetList: WidgetTuple[]): DashboardLayoutWidgetInfo[] => widgetList.map(
    ([widgetId, customInfo]) => {
        try {
            const widgetConfig = getWidgetConfig(widgetId);
            const widgetInfo: DashboardLayoutWidgetInfo = {
                widget_key: uuidv4(),
                widget_name: widgetConfig.widget_config_id,
                version: '1',
                ...customInfo,
            };
            return widgetInfo;
        } catch (e) {
            console.error(e);
            return ERROR_CASE_WIDGET_INFO;
        }
    },
);

export const getDashboardVariablesSchema = (label?: DashboardLabel): DashboardVariablesSchema => {
    const _managedVariablesSchema: DashboardVariablesSchema = cloneDeep(MANAGED_DASH_VAR_SCHEMA);

    if (label === DASHBOARD_LABEL.ASSET) {
        managedVariablesPropertiesMap.forEach((value, key) => {
            if (Object.keys(ASSET_VARIABLE_TYPE_INFO).includes(key)) {
                _managedVariablesSchema.properties[key] = { ...value, use: true }; // set Asset variables to use
            }
        });
        // HACK: remove below code after backend is ready
        _managedVariablesSchema.properties[REFERENCE_TYPE_INFO.service_account.type].use = false;
    } else if (label === DASHBOARD_LABEL.COST) {
        managedVariablesPropertiesMap.forEach((value, key) => {
            if (Object.keys(COST_VARIABLE_TYPE_INFO).includes(key)) {
                _managedVariablesSchema.properties[key] = { ...value, use: true }; // set Cost variables to use
            }
        });
    } else if (label === DASHBOARD_LABEL.BLANK) {
        _managedVariablesSchema.properties[COST_VARIABLE_TYPE_INFO.cost_data_source.type].required = false;
    }
    return _managedVariablesSchema;
};
