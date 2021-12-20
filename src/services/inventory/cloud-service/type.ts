import { RouteQueryString } from '@/lib/router-query-string';
import { CLOUD_SERVICE_PAGE_URL_QUERY_KEY } from '@/services/inventory/cloud-service/lib/config';

export type CloudServicePageUrlQuery = Partial<Record<CLOUD_SERVICE_PAGE_URL_QUERY_KEY, RouteQueryString>>
