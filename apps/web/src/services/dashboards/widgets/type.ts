import type { TranslateResult } from 'vue-i18n';

export interface Legend {
    name: string;
    label?: TranslateResult;
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
