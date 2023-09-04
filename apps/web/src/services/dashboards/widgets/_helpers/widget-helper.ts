import { mergeWith } from 'lodash';
import type { Component } from 'vue';


import type {
    BaseConfigInfo, WidgetConfig,
    WidgetFiltersMap,
} from '@/services/dashboards/widgets/_configs/config';
import { BASE_WIDGET_CONFIGS, CONSOLE_WIDGET_CONFIGS } from '@/services/dashboards/widgets/_configs/widget-list-config';

const mergeCustomizer = (val1, val2) => {
    if (Array.isArray(val1)) return [...new Set(val1.concat(val2))];
    return undefined;
};
const baseWidgetConfigCacheMap = new Map<string, Partial<WidgetConfig>>();
const getMergedBaseWidgetConfig = (configs: BaseConfigInfo[]): Partial<WidgetConfig> => {
    const mergedBaseConfig = mergeWith(
        {},
        ...configs.map((configInfo) => {
            const baseConfigId = configInfo.config_id;
            if (!baseConfigId) {
                throw new Error('There is no config_id in base config info.');
            }

            if (baseWidgetConfigCacheMap.has(baseConfigId)) {
                return baseWidgetConfigCacheMap.get(baseConfigId) as Partial<WidgetConfig>;
            }

            const baseConfig = BASE_WIDGET_CONFIGS[baseConfigId];
            if (!baseConfig) {
                throw new Error(`No matching base widget configuration found. ${baseConfigId} does not exist.`);
            }

            const childConfigs = baseConfig.base_configs;
            if (!childConfigs) {
                baseWidgetConfigCacheMap.set(baseConfigId, baseConfig);
                return baseConfig;
            }

            return getMergedBaseWidgetConfig(childConfigs);
        }),
        mergeCustomizer,
    );

    return mergedBaseConfig;
};

const consoleWidgetConfigCacheMap = new Map<string, WidgetConfig>();
export const getWidgetConfig = (widgetConfigId: string): WidgetConfig => {
    if (consoleWidgetConfigCacheMap.has(widgetConfigId)) return consoleWidgetConfigCacheMap.get(widgetConfigId) as WidgetConfig;

    const config = CONSOLE_WIDGET_CONFIGS[widgetConfigId] as WidgetConfig;
    if (!config?.base_configs) {
        consoleWidgetConfigCacheMap.set(widgetConfigId, config);
        return config;
    }

    const baseWidgetConfigs = config.base_configs;
    const mergedConfig = mergeWith(
        {},
        getMergedBaseWidgetConfig(baseWidgetConfigs),
        config,
        mergeCustomizer,
    );
    consoleWidgetConfigCacheMap.set(widgetConfigId, mergedConfig);
    return consoleWidgetConfigCacheMap.get(widgetConfigId) as WidgetConfig;
};

export const getWidgetComponent = (widgetConfigId: string): Component => {
    const config = getWidgetConfig(widgetConfigId);
    if (!config) throw new Error(`No matching widget configuration found. ${widgetConfigId} does not exist.`);
    const widgetComponent = config.widget_component;
    if (!widgetComponent) throw new Error(`No matching widget component found. ${widgetComponent} does not exist.`);

    return widgetComponent;
};

/**
 * @name getWidgetLocationFilters
 * @param widgetFilters
 * @example { provider: [{k: 'provider', v: ['aws', 'google'], o: '='}] }
 * => { provider: [{k: 'provider', v: 'aws', o: '='}, {k: 'provider', v: 'google', o: '='}] }
 * @description This helper is used to sync with the cost analysis page. Will be deprecated soon.
 */
export const getWidgetLocationFilters = (widgetFilters?: WidgetFiltersMap): WidgetFiltersMap => {
    const result: WidgetFiltersMap = {};
    Object.entries(widgetFilters ?? {}).forEach(([filterKey, filterItems]) => {
        result[filterKey] = [];
        filterItems.forEach((filterItem) => {
            if (Array.isArray(filterItem.v)) {
                filterItem.v.forEach((d) => {
                    result[filterKey].push({
                        k: filterKey, o: filterItem.o, v: d,
                    });
                });
            } else {
                result[filterKey].push({
                    k: filterKey, o: filterItem.o, v: filterItem.v,
                });
            }
        });
    });
    return result;
};
