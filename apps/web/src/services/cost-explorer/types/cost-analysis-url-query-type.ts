import type { RouteQueryString } from '@/lib/router-query-string';


const COST_ANALYSIS_PAGE_URL_QUERY_KEY = ['period', 'group_by', 'filters', 'granularity'] as const;

type CostAnalysisPageUrlQueryKey = typeof COST_ANALYSIS_PAGE_URL_QUERY_KEY[number];

export type CostAnalysisPageUrlQuery = Partial<Record<CostAnalysisPageUrlQueryKey, RouteQueryString>>;
