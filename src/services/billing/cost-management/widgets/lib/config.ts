export const CHART_TYPE = Object.freeze({
    LINE: 'LINE',
    STACKED_LINE: 'STACKED_LINE',
    COLUMN: 'COLUMN',
    STACKED_COLUMN: 'STACKED_COLUMN',
    DONUT: 'DONUT',
});
export type CHART_TYPE = typeof CHART_TYPE[keyof typeof CHART_TYPE];

export const DATE_FORMAT = Object.freeze({
    day: 'YYYY-M-D',
    month: 'YYYY-M',
    year: 'YYYY',
});
