import type { AsyncComponent } from 'vue';

import dayjs from 'dayjs';
import {
    keyBy, merge, mergeWith, sortBy, values,
} from 'lodash';

import { getTimeUnitByPeriod } from '@/services/cost-explorer/lib/helper';
import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import type {
    BaseConfigInfo, Granularity, GroupBy, WidgetConfig,
} from '@/services/dashboards/widgets/config';
import type { HistoryDataModel, XYChartData } from '@/services/dashboards/widgets/type';
import { BASE_WIDGET_CONFIGS, CONSOLE_WIDGET_CONFIGS } from '@/services/dashboards/widgets/widget-config-list';

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

/**
 * @name getWidgetTableDateFields
 * @description Get refined PDataTable fields.
 */
export const getWidgetTableDateFields = (granularity: Granularity, dateRange: DateRange): Field[] => {
    if (!granularity || !dateRange?.end) return [];
    const dateFields: Field[] = [];
    const start = dayjs.utc(dateRange.start);
    const end = dayjs.utc(dateRange.end);

    const timeUnit = getTimeUnitByPeriod(granularity, start, end);
    let labelDateFormat = 'M/D';
    if (timeUnit === 'month') {
        labelDateFormat = 'MMM';
    } else if (timeUnit === 'year') {
        labelDateFormat = 'YYYY';
    }

    let now = start;
    let count = 0;
    while (now.isSameOrBefore(end, timeUnit)) {
        dateFields.push({
            name: `usd_cost_sum.${count}.value`,
            label: now.locale('en').format(labelDateFormat),
            textAlign: 'right',
            textOptions: {
                type: 'cost',
            },
        });
        now = now.add(1, timeUnit);
        count += 1;
    }
    return dateFields;
};
