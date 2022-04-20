import { RouteQueryString } from '@/lib/router-query-string';
import { CLOUD_SERVICE_CATEGORY, CLOUD_SERVICE_PAGE_URL_QUERY_KEY } from '@/services/asset-inventory/cloud-service/lib/config';

export type CloudServicePageUrlQuery = Partial<Record<CLOUD_SERVICE_PAGE_URL_QUERY_KEY, RouteQueryString>>

export type CloudServiceCategory = typeof CLOUD_SERVICE_CATEGORY[keyof typeof CLOUD_SERVICE_CATEGORY]
