import {
    keyBy, merge, sortBy, values,
} from 'lodash';

import type { AllReferenceTypeInfo } from '@/store/reference/all-reference-store';

import type { CostGroupBy } from '@/services/dashboards/widgets/_configs/config';

interface RawData {
    [key: string]: any;
}

interface RefineOptions<T extends RawData, S extends RawData> {
    groupBy?: keyof S & keyof T; // if given, set the value to the groupBy property. { [groupBy]: valueData }
    allReferenceTypeInfo?: AllReferenceTypeInfo; // if both this and groupBy are given, get groupBy label and set the value to the label property. { [groupByLabel]: valueData }
    arrayDataKey: keyof T|(keyof T)[]; // = 'cost_sum' or ['cost_sum', 'budget_sum']
    categoryKey: keyof S; // merge by this key.  = 'date' pr ['date', 'Usage Type Details']
    valueKey: keyof S // 'value'
    useDataKeyAsRefinedValue?: boolean; // only works for vertical chart.
    isHorizontal?: boolean;
    additionalIncludeKeys?: (keyof S)[]; // it will be included in the result. it is the keys of the target array data.
    additionalIncludeKeysFromParent?: (keyof T & keyof S)[]; // it will be included in the result. it is the keys of the parent data.
}
/**
 * @name getRefinedXYChartData
 * @description Convert raw data to XYDateChart data.
 * @example [{ date: '2021-11', aws: 100, azure: 300 }, { date: '2021-09', aws: 300, azure: 100 }]
 */
export const getRefinedXYChartData = <T extends RawData, S extends RawData>(
    rawData: T[],
    options: RefineOptions<T, S>,
): S[] => {
    if (!rawData?.length) return [];


    const {
        groupBy, allReferenceTypeInfo, categoryKey, isHorizontal,
    } = options;

    let chartData: S[] = [];
    rawData.forEach((data) => {
        const groupByLabel = groupBy ? getGroupByLabel<T, S>(data, groupBy, allReferenceTypeInfo) : undefined;
        chartData = isHorizontal
            ? mergeRefinedHorizontalXYChartData(chartData, data, options, groupByLabel)
            : mergeRefinedXYChartData(chartData, data, options, groupByLabel);
    });
    return sortBy(chartData, categoryKey);
};
const mergeRefinedXYChartData = <T extends RawData, S extends RawData>(chartData: S[], data: T, options: RefineOptions<T, S>, groupByLabel: keyof S|undefined): S[] => {
    const {
        arrayDataKey, categoryKey, valueKey, useDataKeyAsRefinedValue, additionalIncludeKeys, additionalIncludeKeysFromParent,
    } = options;
    const arrayDataKeys = Array.isArray(arrayDataKey) ? arrayDataKey : [arrayDataKey];
    let mergedChartData = chartData;
    arrayDataKeys.forEach((arrDataKey) => { // [{date: '2022-11', value: 34}, ...]
        const arrayData = data[arrDataKey];
        const valueSetKey = useDataKeyAsRefinedValue ? (arrDataKey as keyof S) : groupByLabel ?? valueKey;
        const refinedList: S[] = arrayData?.map((valueSet) => {
            const refined = {
                [valueSetKey]: valueSet[valueKey],
                [categoryKey]: valueSet[categoryKey],
            } as S;
            additionalIncludeKeys?.forEach((key) => {
                refined[key] = valueSet[key];
            });
            additionalIncludeKeysFromParent?.forEach((key) => {
                refined[key as keyof S] = data[key] as unknown as S[keyof S];
            });
            return refined;
        }) ?? [];
        mergedChartData = mergeByKey<S>(mergedChartData, refinedList, categoryKey) as S[];
    });
    return mergedChartData;
};
const mergeByKey = <S extends RawData>(arrA: S[], arrB: S[], key: keyof S): S[] => {
    const merged = merge(keyBy(arrA, key), keyBy(arrB, key));
    return values(merged) as S[];
};
const mergeRefinedHorizontalXYChartData = <T extends RawData, S extends RawData>(chartData: S[], data: T, options: RefineOptions<T, S>, groupByLabel: keyof S|undefined): S[] => {
    const {
        groupBy, arrayDataKey, categoryKey, valueKey,
    } = options;
    if (!groupBy) {
        console.error(Error('groupBy is required for horizontal chart.'));
        return [];
    }
    const arrayDataKeys = Array.isArray(arrayDataKey) ? arrayDataKey : [arrayDataKey];
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
const getGroupByLabel = <T extends RawData, S extends RawData>(data: T, groupBy: keyof T, allReferenceTypeInfo?: AllReferenceTypeInfo): keyof S => {
    const referenceMap = Object.values(allReferenceTypeInfo ?? {}).find((info) => info.key === groupBy)?.referenceMap;
    const resourceValue = data[groupBy];
    if (resourceValue) return referenceMap?.[resourceValue]?.label ?? resourceValue; // AmazonCloudFront
    return `no_${groupBy as string}`;
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
