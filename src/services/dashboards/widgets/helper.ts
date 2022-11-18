import type { AsyncComponent } from 'vue';

import { merge } from 'lodash';

import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import { BASE_WIDGET_CONFIGS, CONSOLE_WIDGET_CONFIGS } from '@/services/dashboards/widgets/widget-config-list';

const widgetConfigCacheMap: Record<string, WidgetConfig> = {};
export const getWidgetConfig = (widgetConfigId: string): WidgetConfig => {
    if (widgetConfigCacheMap[widgetConfigId]) return widgetConfigCacheMap[widgetConfigId];

    const config = CONSOLE_WIDGET_CONFIGS[widgetConfigId];
    if (!config?.base_configs) {
        widgetConfigCacheMap[widgetConfigId] = config;
        return config;
    }

    const baseWidgetConfigs = config.base_configs;
    widgetConfigCacheMap[widgetConfigId] = merge(
        {},
        baseWidgetConfigs.map(({ config_id: baseConfigId }) => {
            const baseConfig = BASE_WIDGET_CONFIGS[baseConfigId];
            if (!baseConfig) throw new Error(`[No matched base widget config] ${baseConfigId} base widget config is not exist.`);
            return baseConfig;
        }),
        config,
    );
    return widgetConfigCacheMap[widgetConfigId];
};

export const getWidgetComponent = (widgetConfigId: string): AsyncComponent => {
    const config = getWidgetConfig(widgetConfigId);
    if (!config) throw new Error(`[No matched widget config] ${widgetConfigId} widget config is not exist.`);

    const widgetComponent = config.widget_component;
    if (!widgetComponent) throw new Error(`[No matched widget config] ${widgetConfigId} widget config is not exist.`);

    return widgetComponent;
};
