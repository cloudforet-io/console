export type ChartContext = null | HTMLElement;
export const CHART_TYPE = Object.freeze({
    TREEMAP: 'TREEMAP',
    MAP: 'MAP',
    LINE: 'LINE',
    STACKED_COLUMN: 'STACKED_COLUMN',
    DONUT: 'DONUT',
    PIE: 'PIE',
} as const);
export type ChartType = typeof CHART_TYPE[keyof typeof CHART_TYPE];

export const DATE_VALUE_FIELD = 'date';
