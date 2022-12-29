import type { AsyncComponent } from 'vue';


import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import dayjs from 'dayjs';
import {
    keyBy, merge, mergeWith, sortBy, values,
} from 'lodash';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getTimeUnitByPeriod } from '@/services/cost-explorer/lib/helper';
import type { DateRange } from '@/services/dashboards/config';
import type {
    BaseConfigInfo, Granularity,
    GroupBy, WidgetConfig,
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
 * @name getRefinedDataTableFields
 * @description Get refined PDataTable fields.
 */
export const getRefinedDataTableFields = (granularity: Granularity, dateRange: DateRange): DataTableFieldType[] => {
    if (!granularity || !dateRange?.end) return [];
    const dateFields: DataTableFieldType[] = [];
    const start = dayjs.utc(dateRange.start);
    const end = dayjs.utc(dateRange.end);

    const timeUnit = getTimeUnitByPeriod(granularity, dayjs.utc(dateRange.start), dayjs.utc(dateRange.end));
    let dateFormat = 'YYYY-MM-DD';
    if (granularity === GRANULARITY.MONTHLY) dateFormat = 'YYYY-MM';
    if (granularity === GRANULARITY.YEARLY) dateFormat = 'YYYY';

    const nameDateFormat = dateFormat;
    let labelDateFormat = 'M/D';
    if (timeUnit === 'month') {
        labelDateFormat = 'MMM';
    } else if (timeUnit === 'year') {
        labelDateFormat = 'YYYY';
    }

    let now = start;
    while (now.isSameOrBefore(end, timeUnit)) {
        dateFields.push({
            name: now.format(nameDateFormat),
            label: now.locale('en').format(labelDateFormat),
            textAlign: 'right',
            sortable: true,
        });
        now = now.add(1, timeUnit);
    }
    return dateFields;
};

/**
 * @name getRefinedDataTableData
 * @description Get refined data of PDataTable.
 * @example [{ "provider": "aws", "2022-09": 123, "2022-10": 1, "2022-11": 10 }]
 */
export const getRefinedDataTableData = (rawData: HistoryDataModel['results'], groupBy: GroupBy, valueKey = 'usd_cost_sum') => {
    if (!rawData || !groupBy) return [];
    const results: any = [];
    rawData.forEach((d) => {
        const result = {
            [groupBy]: d[groupBy],
        };
        d[valueKey].forEach((val) => {
            result[val.date] = val.value;
        });
        results.push(result);
    });
    return results;
};
