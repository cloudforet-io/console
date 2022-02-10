import { RouteQueryString } from '@/lib/router-query-string';
import { COST_ANALYSIS_PAGE_URL_QUERY_KEY } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import { CostQueryFilters, Period } from '@/services/billing/cost-management/type';


export type CostAnalysisPageUrlQuery = Partial<Record<COST_ANALYSIS_PAGE_URL_QUERY_KEY, RouteQueryString>>

export interface CostAnalysisPageQueryValue {
    period?: Period;
    groupBy?: GROUP_BY[];
    primaryGroupBy?: GROUP_BY|undefined;
    filters?: CostQueryFilters;
    stack?: boolean;
    granularity?: GRANULARITY;
}
