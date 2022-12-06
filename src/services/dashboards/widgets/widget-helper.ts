import type { AsyncComponent } from 'vue';

import {
    keyBy, merge, sortBy, values,
} from 'lodash';

import type {
    GroupBy, WidgetConfig,
} from '@/services/dashboards/widgets/config';
import type { HistoryDataModel, XYChartData } from '@/services/dashboards/widgets/type';
import { BASE_WIDGET_CONFIGS, CONSOLE_WIDGET_CONFIGS } from '@/services/dashboards/widgets/widget-config-list';

const widgetConfigCacheMap: Record<string, WidgetConfig> = {};
export const getWidgetConfig = (widgetConfigId: string): WidgetConfig => {
    if (widgetConfigCacheMap[widgetConfigId]) return widgetConfigCacheMap[widgetConfigId];

    const config = CONSOLE_WIDGET_CONFIGS[widgetConfigId] as WidgetConfig;
    if (!config?.base_configs) {
        widgetConfigCacheMap[widgetConfigId] = config;
        return config;
    }

    const baseWidgetConfigs = config.base_configs;
    widgetConfigCacheMap[widgetConfigId] = merge(
        {},
        ...baseWidgetConfigs.map(({ config_id: baseConfigId }) => {
            const baseConfig = BASE_WIDGET_CONFIGS[baseConfigId];
            if (!baseConfig) throw new Error(`No matching base widget configuration found. ${baseConfigId} does not exist.`);
            return baseConfig;
        }),
        config,
    );
    return widgetConfigCacheMap[widgetConfigId];
};

export const getWidgetComponent = (widgetConfigId: string): AsyncComponent => {
    const config = getWidgetConfig(widgetConfigId);
    if (!config) throw new Error(`No matching widget configuration found. ${widgetConfigId} does not exist.`);
    const widgetComponent = config.widget_component;
    if (!widgetComponent) throw new Error(`No matching widget component found. ${widgetComponent} does not exist.`);

    return widgetComponent;
};

const mergeByKey = (arrA, arrB, key) => {
    const merged = merge(keyBy(arrA, key), keyBy(arrB, key));
    return values(merged);
};
/**
 * @name getRefinedXYChartData
 * @description Convert raw data to XYDateChart data.
 * @example [{ date: '2021-11', aws: 100, azure: 300 }, { date: '2021-09', aws: 300, azure: 100 }]
 */
export const getRefinedXYChartData = (
    rawData: HistoryDataModel['results'],
    groupBy?: GroupBy,
    categoryKey = 'date',
    valueKey = 'usd_cost_sum',
): XYChartData[] => {
    if (!rawData) return [];

    let chartData;
    rawData.forEach((data) => {
        const groupByName = groupBy ? data[groupBy] : 'value'; // AmazonCloudFront
        const valueList = data[valueKey]; // [{date: '2022-11', value: 34}, ...]
        const refinedList = valueList.map((valueSet) => ({
            date: valueSet.date,
            [groupByName]: valueSet.value,
        }));
        chartData = mergeByKey(chartData, refinedList, categoryKey);
    });
    return sortBy(chartData, categoryKey);
};
