import { v4 as uuidv4 } from 'uuid';

import { ERROR_CASE_WIDGET_INFO } from '@/services/dashboards/default-dashboard/config';
import type { WidgetCustomTitleMap } from '@/services/dashboards/default-dashboard/templates/type';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';

export const getDashboardLayoutWidgetInfoList = (widgetList: string[], widgetCustomTitleMap?: WidgetCustomTitleMap): DashboardLayoutWidgetInfo[] => widgetList.map((widgetId) => {
    try {
        const widgetConfig = getWidgetConfig(widgetId);
        const widgetConfigTitle = widgetConfig.title ?? widgetConfig.widget_config_id;
        const title = widgetCustomTitleMap ? (widgetCustomTitleMap[widgetId] ?? widgetConfigTitle) : widgetConfigTitle;
        const widgetInfo: DashboardLayoutWidgetInfo = {
            widget_key: uuidv4(),
            widget_name: widgetConfig.widget_config_id,
            title,
            widget_options: widgetConfig.options ?? {},
            size: widgetConfig.sizes[0],
            version: '1',
            inherit_options: {},
            default_schema_properties: widgetConfig.options_schema?.default_properties ?? [],
        };
        return widgetInfo;
    } catch (e) {
        console.error(e);
        return ERROR_CASE_WIDGET_INFO;
    }
});
