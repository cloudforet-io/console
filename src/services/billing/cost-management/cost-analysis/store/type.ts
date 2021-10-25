import { CHART_TYPE, GRANULARITY } from '@/services/billing/cost-management/cost-analysis/lib/config';

export interface ChartData {
    [key: string]: any;
}

export type ChartType = typeof CHART_TYPE[keyof typeof CHART_TYPE];
export type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];

export interface GroupByItem {
    name: string;
    label: string;
}

export interface CostAnalysisStoreState {
    selectedChartType: ChartType;
    selectedGranularity: string;
    selectedGroupByItems: Array<GroupByItem>;
    selectedDates: Array<string>;
    chartData: Array<ChartData>;
}
