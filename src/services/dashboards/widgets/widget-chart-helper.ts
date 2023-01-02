import type { IDateAxisSettings } from '@amcharts/amcharts5/xy';
import dayjs from 'dayjs';
import {
    keyBy, merge, sortBy, values,
} from 'lodash';

import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

import type { DateRange } from '@/services/dashboards/config';
import type { GroupBy } from '@/services/dashboards/widgets/config';
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
export const getLegends = (rawData: HistoryDataModel['results'], groupBy: GroupBy, allReferenceTypeInfo: AllReferenceTypeInfo): Legend[] => {
    if (!rawData || !groupBy || !allReferenceTypeInfo) return [];
    const legends: Legend[] = [];
    rawData.forEach((d) => {
        let _name = d[groupBy];
        let _label = d[groupBy];
        const referenceTypeInfo = Object.values(allReferenceTypeInfo).find((info) => info.key === groupBy);
        if (_name && referenceTypeInfo) {
            const referenceMap = referenceTypeInfo.referenceMap;
            _label = referenceMap[_name]?.label ?? referenceMap[_name]?.name ?? _name;
        } else if (!_name) {
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

export const getDateAxisSettings = (dateRange: DateRange): Partial<IDateAxisSettings<any>> => {
    const start = dayjs.utc(dateRange.start);
    const end = dayjs.utc(dateRange.end).add(1, 'month'); // 1 month added because of `max` property bug
    return {
        min: start.valueOf(),
        max: end.valueOf(),
    };
};
