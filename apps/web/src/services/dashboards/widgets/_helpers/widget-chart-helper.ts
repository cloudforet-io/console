import type { IDateAxisSettings } from '@amcharts/amcharts5/xy';
import dayjs from 'dayjs';
import {
    keyBy, merge, sortBy, values,
} from 'lodash';

import type { AllReferenceTypeInfo } from '@/store/reference/all-reference-store';

import type { DateRange } from '@/services/dashboards/config';
import type { CostGroupBy } from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import type {
    Legend,
} from '@/services/dashboards/widgets/type';


interface RawData<S extends Record<string, any> = Record<string, any>> {
    [key: string]: any | S[];
}

interface RefineOptions {
    groupBy?: string; // if given, set the value to the groupBy property. { [groupBy]: valueData }
    allReferenceTypeInfo?: AllReferenceTypeInfo; // if both this and groupBy are given, get groupBy label and set the value to the label property. { [groupByLabel]: valueData }
    arrayDataKey: string|string[]; // = 'cost_sum' or ['cost_sum', 'budget_sum']
    categoryKey: string; // merge by this key.  = 'date' pr ['date', 'Usage Type Details']
    valueKey: string // 'value'
    useDataKeyAsRefinedValue?: boolean; // only works for vertical chart.
    isHorizontal?: boolean;
    additionalIncludeKeys?: string[]; // it will be included in the result. it is the keys of the target array data.
}
/**
 * @name getRefinedXYChartData
 * @description Convert raw data to XYDateChart data.
 * @example [{ date: '2021-11', aws: 100, azure: 300 }, { date: '2021-09', aws: 300, azure: 100 }]
 */
export const getRefinedXYChartData = <T extends RawData = RawData, S extends Record<string, any> = Record<string, any>>(
    rawData: T[],
    options: RefineOptions,
): S[] => {
    if (!rawData?.length) return [];


    const {
        groupBy, allReferenceTypeInfo, categoryKey, isHorizontal,
    } = options;

    let chartData: S[] = [];
    rawData.forEach((data) => {
        const groupByLabel = groupBy ? getGroupByLabel<T>(data, groupBy, allReferenceTypeInfo) : undefined;
        chartData = isHorizontal
            ? mergeRefinedHorizontalXYChartData(chartData, data, options, groupByLabel)
            : mergeRefinedXYChartData(chartData, data, options, groupByLabel);
    });
    return sortBy(chartData, categoryKey);
};
const mergeRefinedXYChartData = <S = RawData>(chartData: S[], data: RawData, options: RefineOptions, groupByLabel: string|undefined): S[] => {
    const {
        arrayDataKey, categoryKey, valueKey, useDataKeyAsRefinedValue, additionalIncludeKeys,
    } = options;
    const arrayDataKeys = typeof arrayDataKey === 'string' ? [arrayDataKey] : arrayDataKey;
    let mergedChartData = chartData;
    arrayDataKeys.forEach((arrDataKey, i) => { // [{date: '2022-11', value: 34}, ...]
        const arrayData = data[arrDataKey];
        const valueSetKey = useDataKeyAsRefinedValue ? arrayDataKeys[i] : groupByLabel ?? valueKey;
        const refinedList: S[] = arrayData?.map((valueSet) => {
            const refined = {
                [valueSetKey]: valueSet[valueKey],
                [categoryKey]: valueSet[categoryKey],
            };
            additionalIncludeKeys?.forEach((key) => {
                refined[key] = valueSet[key];
            });
            return refined;
        }) ?? [];
        mergedChartData = mergeByKey(mergedChartData, refinedList, categoryKey) as S[];
    });
    return mergedChartData;
};
const mergeByKey = <S = RawData>(arrA: S[], arrB: S[], key: string): S[] => {
    const merged = merge(keyBy(arrA, key), keyBy(arrB, key));
    return values(merged) as S[];
};
const mergeRefinedHorizontalXYChartData = <S = RawData>(chartData: S[], data: RawData, options: RefineOptions, groupByLabel: string|undefined): S[] => {
    const {
        groupBy, arrayDataKey, categoryKey, valueKey,
    } = options;
    if (!groupBy) {
        console.error(Error('groupBy is required for horizontal chart.'));
        return [];
    }
    const arrayDataKeys = typeof arrayDataKey === 'string' ? [arrayDataKey] : arrayDataKey;
    const mergedChartData = chartData;
    arrayDataKeys.forEach((arrDataKey) => { // [{date: '2022-11', value: 34}, ...]
        const arrayData = data[arrDataKey];
        if (!arrayData) return;

        let refinedChartItem = {} as S;
        arrayData.forEach((valueSet) => {
            refinedChartItem = {
                ...refinedChartItem,
                [valueSet[categoryKey] as string]: valueSet[valueKey],
                [groupBy]: groupByLabel,
            };
        });

        mergedChartData.push(refinedChartItem);
    });
    return mergedChartData;
};
const getGroupByLabel = <T extends Record<string, any>>(data: T, groupBy: string, allReferenceTypeInfo?: AllReferenceTypeInfo): string => {
    const referenceMap = Object.values(allReferenceTypeInfo ?? {}).find((info) => info.key === groupBy)?.referenceMap;
    const resourceValue = data[groupBy];
    if (resourceValue) return referenceMap?.[resourceValue]?.label ?? resourceValue; // AmazonCloudFront
    return `no_${groupBy}`;
};

/**
 * @name getXYChartLegends
 * @description Extract legends from raw data.
 */
export const getXYChartLegends = <T = Record<string, any>>(
    rawData?: T[],
    groupBy?: string,
    allReferenceTypeInfo?: AllReferenceTypeInfo,
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

export const getPieChartLegends = (rawData: RawData[], groupBy?: string): Legend[] => {
    if (!rawData || !groupBy) return [];
    return rawData.map((d) => ({ name: d[groupBy], disabled: false }));
};

export const getDateAxisSettings = (dateRange: DateRange): Partial<IDateAxisSettings<any>> => {
    const start = dayjs.utc(dateRange.start);
    const end = dayjs.utc(dateRange.end).add(1, 'month'); // 1 month added because of `max` property bug
    return {
        min: start.valueOf(),
        max: end.valueOf(),
    };
};


type AppendedData<T> = T & {
    [groupBy: string]: string | any;
};
/**
 * @name getRefinedPieChartData
 * @description Convert raw data to XYDateChart data.
 * @example(before) [{ provider: 'aws', cost_sum: 100  }, { provider: 'google_cloud', cost_sum: 100  }]
 * @example(after) [{ provider: 'AWS', cost_sum: 100  }, { provider: 'Google Cloud', cost_sum: 100  }]
 */
export const getRefinedPieChartData = <T extends RawData = RawData>(
    rawData: T[],
    groupBy: CostGroupBy,
    allReferenceTypeInfo: AllReferenceTypeInfo,
): AppendedData<T>[] => {
    if (!rawData || !groupBy) return [];

    const chartData: AppendedData<T>[] = [];
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
        } as AppendedData<T>);
    });
    return chartData;
};

