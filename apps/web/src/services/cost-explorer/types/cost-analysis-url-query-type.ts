import type { RouteQueryString } from '@/lib/router-query-string';

import type { COST_ANALYSIS_PAGE_URL_QUERY_KEY } from '@/services/cost-explorer/constants/cost-analysis-url-query-constant';

type CostAnalysisPageUrlQueryKey = typeof COST_ANALYSIS_PAGE_URL_QUERY_KEY[number];

export type CostAnalysisPageUrlQuery = Partial<Record<CostAnalysisPageUrlQueryKey, RouteQueryString>>;
