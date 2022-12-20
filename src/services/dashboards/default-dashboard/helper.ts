import { ERROR_CASE_WIDGET_INFO } from '@/services/dashboards/default-dashboard/config';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/widget-helper';

export const getDashboardLayoutWidgetInfoList = (widgetList: string[]): DashboardLayoutWidgetInfo[] => widgetList.map((widgetId) => {
    try {
        const widgetConfig = getWidgetConfig(widgetId);
        const widgetInfo: DashboardLayoutWidgetInfo = {
            widget_name: widgetConfig.widget_config_id,
            title: widgetConfig.title ?? widgetConfig.widget_config_id,
            widget_options: widgetConfig.widget_options ?? {},
            size: widgetConfig.sizes[0],
            version: '1',
            inherit_options: {},
        };
        return widgetInfo;
    } catch (e) {
        console.error(e);
        return ERROR_CASE_WIDGET_INFO;
    }
});
