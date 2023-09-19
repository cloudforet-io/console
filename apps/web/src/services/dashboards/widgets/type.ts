

export interface XYChartData {
    date?: string;
    [resourceName: string]: number | any; // AmazonCloudFront: 12333
}

export interface Legend {
    name: string;
    label?: string;
    color?: string;
    disabled?: boolean; // this is used only in widget data table
}


export const CHART_TYPE = Object.freeze({
    CARD: 'CARD',
    TREEMAP: 'TREEMAP',
    MAP: 'MAP',
    LINE: 'LINE',
    STACKED_COLUMN: 'STACKED_COLUMN',
    DONUT: 'DONUT',
    PIE: 'PIE',
    WAFFLE: 'WAFFLE',
    TABLE: 'TABLE',
} as const);
export type ChartType = typeof CHART_TYPE[keyof typeof CHART_TYPE];

export interface CostAnalyzeResponse<Result> {
    more?: boolean;
    results: Result[];
}

export interface BudgetUsageAnalyzeResponse<Result> {
    more?: boolean;
    results: Result[];
}
