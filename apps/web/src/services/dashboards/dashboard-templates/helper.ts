import { cloneDeep } from 'lodash';

import getRandomId from '@/lib/random-id-generator';
import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import type { DashboardLabel } from '@/services/dashboards/constants/dashboard-constants';
import { DASHBOARD_LABEL } from '@/services/dashboards/constants/dashboard-constants';
import { ERROR_CASE_WIDGET_INFO } from '@/services/dashboards/dashboard-templates/config';
import { MANAGED_DASH_VAR_SCHEMA } from '@/services/dashboards/managed-variables-schema';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';

type WidgetTuple = [widgetId: string]|[widgetId: string, customInfo: Partial<Pick<DashboardLayoutWidgetInfo, 'title'|'widget_options'|'size'|'inherit_options'|'schema_properties'>>];
export const getDashboardLayoutWidgetInfoList = (widgetList: WidgetTuple[]): DashboardLayoutWidgetInfo[] => widgetList.map(
    ([widgetId, customInfo]) => {
        try {
            const widgetConfig = getWidgetConfig(widgetId);
            const widgetInfo: DashboardLayoutWidgetInfo = {
                widget_key: getRandomId(),
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

const ASSET_VARIABLE_KEYS: string[] = [
    MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key,
    MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.key,
];
const COST_VARIABLE_KEYS: string[] = [
    MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.key,
    MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.key,
];
export const getDashboardVariablesSchema = (label?: DashboardLabel): DashboardVariablesSchema => {
    const _managedVariablesSchema: DashboardVariablesSchema = cloneDeep(MANAGED_DASH_VAR_SCHEMA);

    if (label === DASHBOARD_LABEL.ASSET) {
        ASSET_VARIABLE_KEYS.forEach((key) => {
            _managedVariablesSchema.properties[key].use = true;
            if (key === MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key) {
                _managedVariablesSchema.properties[key].fixed = true;
            }
        });
        _managedVariablesSchema.order = _managedVariablesSchema.order.sort((a, b) => {
            if (COST_VARIABLE_KEYS.includes(a)) {
                return COST_VARIABLE_KEYS.includes(b) ? 0 : 1;
            }
            return COST_VARIABLE_KEYS.includes(b) ? -1 : 0;
        });
        return _managedVariablesSchema;
    }

    if (label === DASHBOARD_LABEL.COST) {
        COST_VARIABLE_KEYS.forEach((key) => {
            _managedVariablesSchema.properties[key].use = true;
            if (key === MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.key) {
                _managedVariablesSchema.properties[key].fixed = true;
            }
        });
        _managedVariablesSchema.order = _managedVariablesSchema.order.sort((a, b) => {
            if (ASSET_VARIABLE_KEYS.includes(a)) {
                return ASSET_VARIABLE_KEYS.includes(b) ? 0 : 1;
            }
            return ASSET_VARIABLE_KEYS.includes(b) ? -1 : 0;
        });
        return _managedVariablesSchema;
    }

    if (label === DASHBOARD_LABEL.BLANK) {
        _managedVariablesSchema.properties[MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.key].fixed = false;
        _managedVariablesSchema.properties[MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key].fixed = false;
        return _managedVariablesSchema;
    }

    return _managedVariablesSchema;
};
