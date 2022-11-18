import type { AsyncComponent } from 'vue';
import type { ImportedComponent } from 'vue/types/options';

import { merge } from 'lodash';

import { BASE_WIDGET_CONFIGS, CONSOLE_WIDGET_CONFIGS } from '@/services/dashboards/widgets/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/type';

const widgetConfigCacheMap = {};
export const getWidgetConfig = (widgetConfigId: string): WidgetConfig => {
    if (widgetConfigCacheMap[widgetConfigId]) return widgetConfigCacheMap[widgetConfigId];

    const config = CONSOLE_WIDGET_CONFIGS[widgetConfigId];
    if (!config?.base_configs) {
        widgetConfigCacheMap[widgetConfigId] = config;
        return config;
    }

    if (!widgetConfigCacheMap[widgetConfigId]) {
        const baseWidgetConfigs = config.base_configs;
        widgetConfigCacheMap[widgetConfigId] = merge(
            {},
            baseWidgetConfigs.map((baseConfigId) => {
                const baseConfig = BASE_WIDGET_CONFIGS[baseConfigId];
                if (!baseConfig) throw new Error(`[No matched base widget config] ${baseConfigId} base widget config is not exist.`);
                return baseConfig;
            }),
            config,
        );
    }
    return widgetConfigCacheMap[widgetConfigId];
};

export const getWidgetComponent = (widgetConfigId: string): AsyncComponent => {
    const config = getWidgetConfig(widgetConfigId);
    if (!config) throw new Error(`[No matched widget config] ${widgetConfigId} widget config is not exist.`);
    const widgetComponent = config.widget_component;
    return () => ({
        component: import(`./${widgetComponent}`) as Promise<ImportedComponent>,
    });
};
