import type { AsyncComponent } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { isEmpty, mergeWith } from 'lodash';

import { i18n } from '@/translations';

import type { DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import type {
    BaseConfigInfo, WidgetConfig,
    InheritOptions, WidgetOptionsSchema,
} from '@/services/dashboards/widgets/_configs/config';
import { BASE_WIDGET_CONFIGS, CONSOLE_WIDGET_CONFIGS } from '@/services/dashboards/widgets/_configs/widget-list-config';

interface InheritOptionsErrorMap {
    [propertyName: string]: TranslateResult;
}

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

export const getWidgetComponent = (widgetConfigId: string): AsyncComponent => {
    const config = getWidgetConfig(widgetConfigId);
    if (!config) throw new Error(`No matching widget configuration found. ${widgetConfigId} does not exist.`);
    const widgetComponent = config.widget_component;
    if (!widgetComponent) throw new Error(`No matching widget component found. ${widgetComponent} does not exist.`);

    return widgetComponent;
};

export const getWidgetInheritOptionsErrorMap = (
    inheritOptions?: InheritOptions,
    widgetOptionsSchema?: WidgetOptionsSchema['schema'],
    dashboardVariables?: DashboardVariables,
    dashboardVariablesSchema?: DashboardVariablesSchema,
): InheritOptionsErrorMap => {
    if (!inheritOptions || isEmpty(inheritOptions)) {
        return {};
    }
    const errorMap: InheritOptionsErrorMap = {};
    Object.entries(inheritOptions).forEach(([propertyName, inheritOption]) => {
        if (!inheritOption?.enabled) return;

        const variableKey = inheritOption?.variable_info?.key;
        if (!variableKey || !dashboardVariablesSchema?.properties?.[variableKey] || !dashboardVariables?.[variableKey]) {
            errorMap[propertyName] = i18n.t('This property does not exist on the dashboard variables.');
            return;
        }

        const variableType = dashboardVariablesSchema.properties[variableKey].selection_type === 'MULTI' ? 'array' : 'string';
        const widgetPropertyType = widgetOptionsSchema.properties[propertyName].type;
        if (variableType !== widgetPropertyType) {
            errorMap[propertyName] = i18n.t('This property has a different type from the dashboard variable.');
        }
    });
    return errorMap;
};
