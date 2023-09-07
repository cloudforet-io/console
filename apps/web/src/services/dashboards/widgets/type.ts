import type { TranslateResult } from 'vue-i18n';

export interface CostAnalyzeDataModel {
    more?: boolean;
    results: Array<{
        [groupBy: string]: string | any; // product: 'AmazonCloudFront'
        cost_sum?: Array<{
            [field_group: string]: any;
            value: number
        }> | number;
        usage_quantity_sum?: Array<{
            [field_group: string]: any;
            value: number
        }> | number;
        _total_cost_sum?: number;
        _total_usage_quantity_sum?: number;
    }>;
}

export interface AnalyzeDataModel {
    more?: boolean;
    results: Array<{
        [groupBy: string]: string | any; // product: 'AmazonCloudFront'
        // cost-analysis/analyze
        cost_sum?: Array<{
            [field_group: string]: any;
            value: number
        }> | number;
        usage_quantity_sum?: Array<{
            [field_group: string]: any;
            value: number
        }> | number;
        _total_cost_sum?: number;
        _total_usage_quantity_sum?: number;
        // cloud-service/stats
        value?: Array<{ date: string; value: number }>;
    }>;
}

export interface BudgetDataModel {
    more?: boolean;
    results: Array<{
        [groupBy: string]: string | any; // budget_id: 'budget-xxxx'
        total_spent?: number;
        total_budget?: number;
        budget_usage?: number;
    }>;
}

export interface XYChartData {
    date?: string;
    [resourceName: string]: number | any; // AmazonCloudFront: 12333
}

export interface Legend {
    name: string;
    label?: TranslateResult;
    color?: string;
    disabled?: boolean; // this is used only in widget data table
}

export interface PieChartData {
    [groupBy: string]: string | any;
    cost_sum?: number;
    usage_quantity_sum?: number;
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
