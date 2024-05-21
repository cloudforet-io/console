import {
    keyBy, merge, sortBy, values,
} from 'lodash';

import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';

interface RawData {
    [key: string]: any;
}

interface RefineOptions<T extends RawData, S extends RawData> {
    dataField?: keyof S & keyof T; // if given, set the value to the dataField property. { [dataField]: valueData }
    allReferenceTypeInfo?: AllReferenceTypeInfo; // if both this and dataField are given, get dataField label and set the value to the label property. { [dataFieldLabel]: valueData }
    arrayDataKey: keyof T|(keyof T)[]; // = 'value_sum' or ['value_sum', 'budget_sum']
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
        dataField, allReferenceTypeInfo, categoryKey, isHorizontal,
    } = options;

    let chartData: S[] = [];
    rawData.forEach((data) => {
        const dataFieldLabel = dataField ? getDataFieldLabel<T, S>(data, dataField, allReferenceTypeInfo) : undefined;
        chartData = isHorizontal
            ? mergeRefinedHorizontalXYChartData(chartData, data, options, dataFieldLabel)
            : mergeRefinedXYChartData(chartData, data, options, dataFieldLabel);
    });
    return sortBy(chartData, categoryKey);
};
const mergeRefinedXYChartData = <T extends RawData, S extends RawData>(chartData: S[], data: T, options: RefineOptions<T, S>, dataFieldLabel: keyof S|undefined): S[] => {
    const {
        arrayDataKey, categoryKey, valueKey, useDataKeyAsRefinedValue, additionalIncludeKeys, additionalIncludeKeysFromParent,
    } = options;
    const arrayDataKeys = Array.isArray(arrayDataKey) ? arrayDataKey : [arrayDataKey];
    let mergedChartData = chartData;
    arrayDataKeys.forEach((arrDataKey) => { // [{date: '2022-11', value: 34}, ...]
        const arrayData = data[arrDataKey];
        const valueSetKey = useDataKeyAsRefinedValue ? (arrDataKey as keyof S) : dataFieldLabel ?? valueKey;
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
const mergeRefinedHorizontalXYChartData = <T extends RawData, S extends RawData>(chartData: S[], data: T, options: RefineOptions<T, S>, dataFieldLabel: keyof S|undefined): S[] => {
    const {
        dataField, arrayDataKey, categoryKey, valueKey, additionalIncludeKeysFromParent,
    } = options;
    if (!dataField) {
        console.error(Error('dataField is required for horizontal chart.'));
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
                [dataField]: dataFieldLabel,
            };

            if (additionalIncludeKeysFromParent) {
                additionalIncludeKeysFromParent.forEach((key) => {
                    refinedChartItem[key as keyof S] = valueSet[key] as unknown as S[keyof S];
                });
            }
        });

        mergedChartData.push(refinedChartItem);
    });
    return mergedChartData;
};
const getDataFieldLabel = <T extends RawData, S extends RawData>(data: T, dataField: keyof T, allReferenceTypeInfo?: AllReferenceTypeInfo): keyof S => {
    const referenceMap = Object.values(allReferenceTypeInfo ?? {}).find((info) => info.key === dataField)?.referenceMap;
    const resourceValue = data[dataField];
    if (resourceValue) return referenceMap?.[resourceValue]?.label ?? resourceValue; // AmazonCloudFront
    return `no_${dataField as string}`;
};


type AppendedData<T> = T & {
    [dataField: string]: string | any;
};
/**
 * @name getRefinedPieChartData
 * @description Convert raw data to XYDateChart data.
 * @example(before) [{ provider: 'aws', value_sum: 100  }, { provider: 'google_cloud', value_sum: 100  }]
 * @example(after) [{ provider: 'AWS', value_sum: 100  }, { provider: 'Google Cloud', value_sum: 100  }]
 */
export const getRefinedPieChartData = <T extends RawData = RawData>(
    rawData: T[]|undefined,
    dataField: string|undefined,
    allReferenceTypeInfo: AllReferenceTypeInfo,
): AppendedData<T>[] => {
    if (!rawData || !dataField) return [];

    const chartData: AppendedData<T>[] = [];
    rawData.forEach((d) => {
        let _name = d[dataField];
        const referenceTypeInfo = Object.values(allReferenceTypeInfo).find((info) => info.key === dataField);
        if (_name && referenceTypeInfo) {
            const referenceMap = referenceTypeInfo.referenceMap;
            _name = referenceMap[_name]?.label ?? referenceMap[_name]?.name ?? _name;
        } else if (!_name) {
            _name = 'Unknown';
        }
        chartData.push({
            ...d,
            [dataField]: _name,
        } as AppendedData<T>);
    });
    return chartData;
};
