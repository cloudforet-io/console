import {
    keyBy, merge, sortBy, values,
} from 'lodash';

import type { ReferenceMap } from '@/store/modules/reference/type';

import type { GroupBy } from '@/services/dashboards/widgets/config';
import { GROUP_BY } from '@/services/dashboards/widgets/config';
import type { HistoryDataModel, XYChartData, Legend } from '@/services/dashboards/widgets/type';


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
 * @name getLegends
 * @description Extract legends from raw data.
 */
export const getLegends = (rawData: HistoryDataModel['results'], groupBy: GroupBy, referenceMap: ReferenceMap): Legend[] => {
    if (!rawData || !groupBy || !referenceMap) return [];
    const legends: Legend[] = [];
    rawData.forEach((d) => {
        let _name = d[groupBy];
        let _label = d[groupBy];
        if (groupBy === GROUP_BY.PROJECT_GROUP) {
            _label = referenceMap.projectGroup[_name]?.label || _name;
        } else if (groupBy === GROUP_BY.PROJECT) {
            _label = referenceMap.projects[_name]?.label || _name;
        } else if (groupBy === GROUP_BY.SERVICE_ACCOUNT) {
            _label = referenceMap.serviceAccount[_name]?.label || _name;
        } else if (groupBy === GROUP_BY.REGION) {
            _label = referenceMap.region[_name]?.name || _name;
        } else if (groupBy === GROUP_BY.PROVIDER) {
            _label = referenceMap.provider[_name]?.name || _name;
        }
        if (!_name) {
            _name = `no_${groupBy}`;
            _label = 'Unknown';
        }
        legends.push({
            name: _name,
            label: _label,
            disabled: false,
        });
    });
    return legends;
};
