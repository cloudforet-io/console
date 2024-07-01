import { CONSOLE_WIDGET_CONFIG } from '@/common/modules/widgets/_constants/widget-config-list-constant';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const consoleWidgetConfigCacheMap = new Map<string, WidgetConfig>();

export const getWidgetConfig = (widgetName?: string): WidgetConfig|undefined => {
    if (!widgetName) return undefined;
    if (consoleWidgetConfigCacheMap.has(widgetName)) return consoleWidgetConfigCacheMap.get(widgetName) as WidgetConfig;

    const config = CONSOLE_WIDGET_CONFIG[widgetName] as WidgetConfig;
    consoleWidgetConfigCacheMap.set(widgetName, config);
    return config;
};
