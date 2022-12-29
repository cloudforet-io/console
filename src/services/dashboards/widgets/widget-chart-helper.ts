import {
    keyBy, merge, sortBy, values,
} from 'lodash';

import type { GroupBy } from '@/services/dashboards/widgets/config';
import type { HistoryDataModel, XYChartData } from '@/services/dashboards/widgets/type';

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
