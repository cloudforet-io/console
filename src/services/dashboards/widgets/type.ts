import type { TranslateResult } from 'vue-i18n';

export interface HistoryDataModel {
    more?: boolean;
    results: Array<{
        [groupBy: string]: string | any; // product: 'AmazonCloudFront'
        usd_cost_sum?: Array<{
            [field_group: string]: any;
            value: number
        }>;
        usage_quantity_sum?: Array<{
            [field_group: string]: any;
            value: number
        }>;
    }>;
}

export interface AccumulatedDataModel {
    more?: boolean;
    results: Array<{
        [groupBy: string]: string | any;
        usd_cost_sum?: number;
    }>
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
