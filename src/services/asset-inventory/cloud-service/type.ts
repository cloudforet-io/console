import { RouteQueryString } from '@/lib/router-query-string';
import { CLOUD_SERVICE_CATEGORY, CLOUD_SERVICE_FILTER_KEY, CLOUD_SERVICE_PAGE_URL_QUERY_KEY } from '@/services/asset-inventory/cloud-service/lib/config';

export type CloudServicePageUrlQuery = Partial<Record<CLOUD_SERVICE_PAGE_URL_QUERY_KEY, RouteQueryString>>

export type CloudServiceFilterKey = typeof CLOUD_SERVICE_FILTER_KEY[keyof typeof CLOUD_SERVICE_FILTER_KEY];

export type CloudServiceCategory = typeof CLOUD_SERVICE_CATEGORY[keyof typeof CLOUD_SERVICE_CATEGORY]

export type CloudServiceFilterMap = Partial<Record<CloudServiceFilterKey, string[]>>
