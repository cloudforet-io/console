export const REQUEST_TYPE = Object.freeze({
    SAVE: 'SAVE',
    EDIT: 'EDIT',
});

export type REQUEST_TYPE = typeof REQUEST_TYPE[keyof typeof REQUEST_TYPE];

export const COST_ANALYSIS_PAGE_URL_QUERY_KEY = ['period', 'groupBy', 'primaryGroupBy', 'filters', 'stack', 'granularity'] as const;
export type COST_ANALYSIS_PAGE_URL_QUERY_KEY = typeof COST_ANALYSIS_PAGE_URL_QUERY_KEY[number];
