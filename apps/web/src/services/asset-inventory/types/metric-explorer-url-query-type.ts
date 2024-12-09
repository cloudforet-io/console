import type { RouteQueryString } from '@/lib/router-query-string';


const METRIC_EXPLORER_PAGE_URL_QUERY_KEY = [
    // for home (asset summary widget)
    'groupBy',
    'group',
    'type',
    // for dashboard full data link
    'period',
    'group_by',
    'filters',
    'granularity',
] as const;

type MetricExplorerPageUrlQueryKey = typeof METRIC_EXPLORER_PAGE_URL_QUERY_KEY[number];
export type MetricExplorerPageUrlQuery = Partial<Record<MetricExplorerPageUrlQueryKey, RouteQueryString>>;
