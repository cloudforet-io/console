import { WIDGET_SIZE } from '@/schema/dashboard/_constants/widget-constant';
import type {
    DashboardLayoutWidgetInfo,
} from '@/schema/dashboard/_types/dashboard-type';

import getRandomId from '@/lib/random-id-generator';

import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';



const ERROR_CASE_WIDGET_INFO: Omit<DashboardLayoutWidgetInfo, 'version'|'widget_key'> = {
    title: 'Error',
    widget_name: 'widgetError',
    widget_options: {},
    size: WIDGET_SIZE.md,
    inherit_options: {},
};

type WidgetTuple = [widgetId: string]|[widgetId: string, customInfo: Partial<Pick<
    DashboardLayoutWidgetInfo,
    'title'|'widget_options'|'size'|'inherit_options'|'schema_properties'|'template_widget_id'
>>];
export const getDashboardLayoutWidgetInfoList = (widgetList: WidgetTuple[], fixedOptions: Record<string, any> = {}): DashboardLayoutWidgetInfo[] => widgetList.map(
    ([widgetId, customInfo]) => {
        try {
            const widgetConfig = getWidgetConfig(widgetId);
            const widgetInfo: DashboardLayoutWidgetInfo = {
                widget_key: getRandomId(),
                widget_name: widgetConfig.widget_config_id,
                version: '1',
                fixed_options: fixedOptions,
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
