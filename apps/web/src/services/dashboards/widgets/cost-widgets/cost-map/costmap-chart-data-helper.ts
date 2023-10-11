import type { ReferenceMap } from '@/store/modules/reference/type';
import type { AllReferenceTypeInfo } from '@/store/reference/all-reference-store';

import type { CostGroupBy } from '@/services/dashboards/widgets/_configs/config';

/**
 * @name getRefinedTreemapChartData
 * @description Convert raw data to TreemapChart data.
 */
export const getRefinedTreemapChartData = (rawDataList: AnalyzeRawData[], groupBy: CostGroupBy|undefined, allReferenceTypeInfo: AllReferenceTypeInfo) => {
    const chartData: TreemapChartData[] = [{
        children: [],
    }];
    if (!rawDataList || !groupBy) return [];

    const referenceMap = Object.values(allReferenceTypeInfo).find((info) => info.key === groupBy)?.referenceMap;
    rawDataList.forEach((rawData) => {
        const groupByValue = rawData[groupBy];
        const label = convertValueToLabel(groupByValue, referenceMap);

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
    cost_sum: number; // valueField
    _total_cost_sum: number;
} & Partial<Record<CostGroupBy, string>>;

interface TreemapChartChild extends AnalyzeRawData {
    value: string; // categoryField
    background_color?: string;
    font_color?: string;
}
export interface TreemapChartData {
    children: TreemapChartChild[];
}

