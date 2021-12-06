import { RouteQueryString } from '@/lib/router-query-string';
import { COST_ANALYSIS_PAGE_URL_QUERY_KEY } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { CHART_TYPE } from '@/services/billing/cost-management/widgets/lib/config';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { CostQueryFilters, Period } from '@/services/billing/cost-management/type';


export type CostAnalysisPageUrlQuery = Partial<Record<COST_ANALYSIS_PAGE_URL_QUERY_KEY, RouteQueryString>>

export interface CostAnalysisPageQueryValue {
    period?: Period;
    groupBy?: string[];
    filters?: CostQueryFilters;
    chartType?: CHART_TYPE;
    granularity?: GRANULARITY;
}
