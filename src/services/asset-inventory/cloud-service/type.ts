import { RouteQueryString } from '@/lib/router-query-string';
import { CLOUD_SERVICE_CATEGORY, CLOUD_SERVICE_FILTER_KEY, CLOUD_SERVICE_PAGE_URL_QUERY_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';

type CloudServicePageUrlQueryKey = typeof CLOUD_SERVICE_PAGE_URL_QUERY_KEY[number];

export type CloudServicePageUrlQuery = Partial<Record<CloudServicePageUrlQueryKey, RouteQueryString>>

export type CloudServicePageUrlQueryValue = {
    provider?: string;
    service?: CloudServiceCategory[];
    region?: string[];
    period?: Period;
    filters?: QueryStoreFilter[];
}

export type CloudServiceFilterKey = typeof CLOUD_SERVICE_FILTER_KEY[keyof typeof CLOUD_SERVICE_FILTER_KEY];

export type CloudServiceCategory = typeof CLOUD_SERVICE_CATEGORY[keyof typeof CLOUD_SERVICE_CATEGORY]

export type CloudServiceFilterMap = {
    [CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]?: CloudServiceCategory[];
    [CLOUD_SERVICE_FILTER_KEY.REGION]?: string[];
}

export interface Period {
    start?: string;
    end?: string;
}
