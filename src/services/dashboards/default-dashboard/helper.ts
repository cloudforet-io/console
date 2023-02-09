import { v4 as uuidv4 } from 'uuid';

import { ERROR_CASE_WIDGET_INFO } from '@/services/dashboards/default-dashboard/config';
import type { DashboardLayoutWidgetInfo, InheritOptions } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';

export const getDashboardLayoutWidgetInfoList = (widgetList: string[]): DashboardLayoutWidgetInfo[] => widgetList.map((widgetId) => {
    try {
        const widgetConfig = getWidgetConfig(widgetId);
        const _defaultProperties = widgetConfig.options_schema?.default_properties ?? [];
        const _requiredProperties = widgetConfig.options_schema?.schema.required ?? [];
        const _inheritOptions: InheritOptions = {};
        _defaultProperties.filter((d) => !_requiredProperties.includes(d)).forEach((propertyName) => {
            _inheritOptions[propertyName] = {
                enabled: true,
                variable_info: { key: propertyName.replace('filters.', '') },
            };
        });
        const widgetInfo: DashboardLayoutWidgetInfo = {
            widget_key: uuidv4(),
            widget_name: widgetConfig.widget_config_id,
            title: widgetConfig.title ?? widgetConfig.widget_config_id,
            widget_options: widgetConfig.options ?? {},
            size: widgetConfig.sizes[0],
            version: '1',
            inherit_options: _inheritOptions,
            default_schema_properties: _defaultProperties,
        };
        return widgetInfo;
    } catch (e) {
        console.error(e);
        return ERROR_CASE_WIDGET_INFO;
    }
});
