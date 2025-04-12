import type { CostDataField } from '@/api-clients/dashboard/_types/widget-type';

import type { ReferenceMap } from '@/store/reference/type';

import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';

/**
 * @name getRefinedTreemapChartData
 * @description Convert raw data to TreemapChart data.
 */
export const getRefinedTreemapChartData = (rawDataList: AnalyzeRawData[], dataField: CostDataField|undefined, allReferenceTypeInfo: AllReferenceTypeInfo) => {
    const chartData: TreemapChartData[] = [{
        children: [],
    }];
    if (!rawDataList || !dataField) return [];

    const referenceMap = Object.values(allReferenceTypeInfo).find((info) => info.key === dataField)?.referenceMap;
    rawDataList.forEach((rawData) => {
        const dataFieldValue = rawData[dataField];
        const label = convertValueToLabel(dataFieldValue, referenceMap);

        chartData[0].children.push({
            ...rawData,
            value: label,
        });
    });
    return chartData;
};

const convertValueToLabel = (value?: string, referenceMap?: ReferenceMap) => {
    if (!value) return 'Unknown';
    return referenceMap?.[value]?.label ?? referenceMap?.[value]?.name ?? value;
};

export type AnalyzeRawData = {
    value_sum: number; // valueField
    _total_value_sum: number;
} & Partial<Record<CostDataField, string>>;

interface TreemapChartChild extends AnalyzeRawData {
    value: string; // categoryField
    background_color?: string;
    font_color?: string;
}
export interface TreemapChartData {
    children: TreemapChartChild[];
}

