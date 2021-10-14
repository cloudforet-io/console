export interface ChartData {
    [key: string]: any;
}

export interface GroupByItem {
    name: string;
    label: string;
}

export interface CostAnalysisStoreState {
    selectedGranularity: string;
    selectedGroupByItems: Array<GroupByItem>;
    chartData: Array<ChartData>;
}
