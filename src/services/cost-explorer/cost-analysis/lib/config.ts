export const REQUEST_TYPE = Object.freeze({
    SAVE: 'SAVE',
    EDIT: 'EDIT',
});

export type RequestType = typeof REQUEST_TYPE[keyof typeof REQUEST_TYPE];

export const COST_ANALYSIS_PAGE_URL_QUERY_KEY = ['period', 'groupBy', 'primaryGroupBy', 'moreGroupBy', 'filters', 'stack', 'granularity'] as const;

export type CostAnalysisPageUrlQueryKey = typeof COST_ANALYSIS_PAGE_URL_QUERY_KEY[number];
