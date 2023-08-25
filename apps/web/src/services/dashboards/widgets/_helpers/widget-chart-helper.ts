import type { IDateAxisSettings } from '@amcharts/amcharts5/xy';
import dayjs from 'dayjs';
import {
    keyBy, merge, sortBy, values,
} from 'lodash';

import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

import type { DateRange } from '@/services/dashboards/config';
import type { CostGroupBy } from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import type {
    CostAnalyzeDataModel, XYChartData, Legend, TreemapChartData, PieChartData,
} from '@/services/dashboards/widgets/type';


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
    rawData: CostAnalyzeDataModel['results'],
    groupBy?: CostGroupBy,
    categoryKey = 'date',
    valueKey = 'usd_cost_sum',
    isHorizontal = false,
    allReferenceTypeInfo?: AllReferenceTypeInfo,
): XYChartData[] => {
    if (!rawData) return [];

    let chartData: XYChartData[] = [];
    rawData.forEach((data) => {
        let groupByName;
        if (groupBy) {
            const referenceMap = Object.values(allReferenceTypeInfo ?? {}).find((info) => info.key === groupBy)?.referenceMap;
            groupByName = referenceMap ? referenceMap[data[groupBy]]?.label : data[groupBy]; // AmazonCloudFront
        } else {
            groupByName = 'value';
        }
        if (!groupByName) groupByName = `no_${groupBy}`;
        const valueList = data[valueKey]; // [{date: '2022-11', value: 34}, ...]
        const refinedList: Record<string, any>[] = valueList.map((valueSet) => {
            if (isHorizontal && !!groupBy) {
                return {
                    [groupBy]: groupByName,
                    [valueSet[categoryKey]]: valueSet.value,
                };
            }
            return {
                [categoryKey]: valueSet[categoryKey],
                [groupByName]: valueSet.value,
            };
        });
        if (isHorizontal) {
            chartData.push(Object.assign({}, ...refinedList));
        } else {
            chartData = mergeByKey(chartData, refinedList, categoryKey) as XYChartData[];
        }
    });
    return sortBy(chartData, categoryKey);
};


/**
 * @name getXYChartLegends
 * @description Extract legends from raw data.
 */
export const getXYChartLegends = (
    rawData: CostAnalyzeDataModel['results'],
    groupBy: CostGroupBy,
    allReferenceTypeInfo: AllReferenceTypeInfo,
    disableReferenceColor = false,
): Legend[] => {
    if (!rawData || !groupBy || !allReferenceTypeInfo) return [];
    const legends: Legend[] = [];
    rawData.forEach((d) => {
        let _name = d[groupBy];
        let _label = d[groupBy];
        let _color;
        const referenceTypeInfo = Object.values(allReferenceTypeInfo).find((info) => info.key === groupBy);
        if (_name && referenceTypeInfo) {
            const referenceMap = referenceTypeInfo.referenceMap;
            _label = referenceMap[_name]?.label ?? referenceMap[_name]?.name ?? _name;
            if (groupBy === COST_GROUP_BY.PROVIDER && !disableReferenceColor) {
                _color = referenceMap[_name]?.color;
            }
        } else if (!_name) {
            _name = `no_${groupBy}`;
            _label = 'Unknown';
        }
        legends.push({
            name: _name,
            label: _label,
            color: _color,
            disabled: false,
        });
    });
    return legends;
};

export const getPieChartLegends = (rawData: CostAnalyzeDataModel['results'], groupBy: CostGroupBy): Legend[] => {
    if (!rawData || !groupBy) return [];
    return rawData.map((d) => ({ name: d[groupBy], disabled: false }));
};

export const getDateAxisSettings = (dateRange: DateRange): Partial<IDateAxisSettings<any>> => {
    const start = dayjs.utc(dateRange.start);
    const end = dayjs.utc(dateRange.end);
    return {
        min: start.valueOf(),
        max: end.valueOf(),
    };
};


/**
 * @name getRefinedTreemapChartData
 * @description Convert raw data to TreemapChart data.
 */
export const getRefinedTreemapChartData = (rawData: TreemapChartData['children'], groupBy: CostGroupBy, allReferenceTypeInfo: AllReferenceTypeInfo) => {
    const chartData: TreemapChartData[] = [{
        name: 'Root',
        value: '',
        children: [],
    }];
    if (!rawData || !groupBy) return [];

    const referenceMap = Object.values(allReferenceTypeInfo).find((info) => info.key === groupBy)?.referenceMap;
    rawData.forEach((d) => {
        const _name = d[groupBy];
        let _label = d[groupBy];
        if (_name) _label = referenceMap?.[_name]?.label ?? referenceMap?.[_name]?.name ?? _name;
        else if (!_name) _label = 'Unknown';

        chartData[0].children.push({
            ...d,
            value: _label,
        });
    });
    return chartData;
};


/**
 * @name getRefinedPieChartData
 * @description Convert raw data to XYDateChart data.
 * @example(before) [{ provider: 'aws', usd_cost_sum: 100  }, { provider: 'google_cloud', usd_cost_sum: 100  }]
 * @example(after) [{ provider: 'AWS', usd_cost_sum: 100  }, { provider: 'Google Cloud', usd_cost_sum: 100  }]
 */
export const getRefinedPieChartData = (
    rawData: CostAnalyzeDataModel['results'],
    groupBy: CostGroupBy,
    allReferenceTypeInfo: AllReferenceTypeInfo,
): PieChartData[] => {
    if (!rawData || !groupBy) return [];

    const chartData: PieChartData[] = [];
    rawData.forEach((d) => {
        let _name = d[groupBy];
        const referenceTypeInfo = Object.values(allReferenceTypeInfo).find((info) => info.key === groupBy);
        if (_name && referenceTypeInfo) {
            const referenceMap = referenceTypeInfo.referenceMap;
            _name = referenceMap[_name]?.label ?? referenceMap[_name]?.name ?? _name;
        } else if (!_name) {
            _name = 'Unknown';
        }
        chartData.push({
            ...d,
            [groupBy]: _name,
        } as PieChartData);
    });
    return chartData;
};

