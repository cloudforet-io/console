import { RouteQueryString } from '@/lib/router-query-string';
import { COST_ANALYSIS_PAGE_URL_QUERY_KEY } from '@/services/cost-explorer/cost-analysis/lib/config';
import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/lib/config';
import { CostQueryFilters, Period } from '@/services/cost-explorer/type';


export type CostAnalysisPageUrlQuery = Partial<Record<COST_ANALYSIS_PAGE_URL_QUERY_KEY, RouteQueryString>>

export interface CostAnalysisPageQueryValue {
    period?: Period;
    groupBy?: GROUP_BY[];
    primaryGroupBy?: GROUP_BY;
    filters?: CostQueryFilters;
    stack?: boolean;
    granularity?: GRANULARITY;
}

export const CHART_TYPE = Object.freeze({
    STACKED_COLUMN: 'STACKED_COLUMN',
    DONUT: 'DONUT',
});
export type CHART_TYPE = typeof CHART_TYPE[keyof typeof CHART_TYPE];
