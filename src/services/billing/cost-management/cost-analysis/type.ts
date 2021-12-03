import { RouteQueryString } from '@/lib/router-query-string';
import { COST_ANALYSIS_PAGE_URL_QUERY_KEY } from '@/services/billing/cost-management/cost-analysis/lib/config';


export type CostAnalysisPageUrlQuery = Partial<Record<COST_ANALYSIS_PAGE_URL_QUERY_KEY, RouteQueryString>>
