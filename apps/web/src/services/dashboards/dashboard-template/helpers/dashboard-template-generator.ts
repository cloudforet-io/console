import { cloneDeep } from 'lodash';

import { WIDGET_SIZE } from '@/schema/dashboard/_constants/widget-constant';
import type {
    DashboardLayoutWidgetInfo,
    DashboardVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';

import getRandomId from '@/lib/random-id-generator';

import { MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP, MANAGED_DASHBOARD_VARIABLES_SCHEMA } from '@/services/dashboards/constants/dashboard-managed-variables-schema';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-config-helper';



const ERROR_CASE_WIDGET_INFO: Omit<DashboardLayoutWidgetInfo, 'version'|'widget_key'> = {
    title: 'Error',
    widget_name: 'widgetError',
    widget_options: {},
    size: WIDGET_SIZE.md,
    inherit_options: {},
};

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
            return {
                ...ERROR_CASE_WIDGET_INFO,
                widget_key: getRandomId(),
                version: '1',
            };
        }
    },
);


export const getRefinedDashboardVariablesSchema = (fixedKeys: string[] = [], excludedKeys: string[] = []): DashboardVariablesSchema => {
    const _refinedProperties: DashboardVariablesSchema['properties'] = cloneDeep(MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties);
    excludedKeys.forEach((key) => {
        delete _refinedProperties[key];
    });
    Object.entries(_refinedProperties).forEach(([key, value]) => {
        _refinedProperties[key] = {
            ...value,
            fixed: fixedKeys.includes(key),
            use: fixedKeys.includes(key),
        };
    });
    return {
        properties: _refinedProperties,
        order: Object.values(MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP).filter((d) => !excludedKeys.includes(d.key)).map((info) => info.key),
    };
};
