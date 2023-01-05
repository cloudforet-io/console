import type { TranslateResult } from 'vue-i18n';

export interface CostAnalyzeDataModel {
    more?: boolean;
    results: Array<{
        [groupBy: string]: string | any; // product: 'AmazonCloudFront'
        usd_cost_sum?: Array<{
            [field_group: string]: any;
            value: number
        }> | number;
        usage_quantity_sum?: Array<{
            [field_group: string]: any;
            value: number
        }> | number;
    }>;
}

export interface BudgetDataModel {
    more?: boolean;
    results: Array<{
        budget_id: string;
        name?: string;
        total_spent?: number;
        total_budget?: number;
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
    disabled?: boolean;
}

export interface TreemapChartData {
    name: string;
    value?: any;
    children: Array<{
        [groupBy: string]: string | any;
        usd_cost_sum: number;
        label?: string;
        background_color?: string;
        font_color?: string;
    }>;
}
