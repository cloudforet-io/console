import { NEW_CONSOLE_WIDGET_CONFIG } from '@/common/modules/widgets/_constants/widget-config-list-constant';
import type { NewWidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const consoleWidgetConfigCacheMap = new Map<string, NewWidgetConfig>();

export const getWidgetConfig = (widgetName: string): NewWidgetConfig => {
    if (consoleWidgetConfigCacheMap.has(widgetName)) return consoleWidgetConfigCacheMap.get(widgetName) as NewWidgetConfig;

    const config = NEW_CONSOLE_WIDGET_CONFIG[widgetName] as NewWidgetConfig;
    consoleWidgetConfigCacheMap.set(widgetName, config);
    return config;
};
