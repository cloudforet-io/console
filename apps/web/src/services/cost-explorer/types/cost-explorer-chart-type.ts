import type { TranslateResult } from 'vue-i18n';


export interface ChartData {
    [key: string]: any;
}
export interface XYChartData {
    date: string;
    totalCost?: number;
    aggregation?: number;
    [key: string]: any;
}
export interface Legend {
    name: string;
    label: string | TranslateResult;
    color?: string;
    disabled?: boolean;
}
