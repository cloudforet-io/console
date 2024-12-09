import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { RouteQueryString } from '@/lib/router-query-string';

import type {
    CLOUD_SERVICE_CATEGORY, CLOUD_SERVICE_FILTER_KEY, CLOUD_SERVICE_MAIN_PAGE_URL_QUERY_KEY, CLOUD_SERVICE_GLOBAL_FILTER_KEY,
    CLOUD_SERVICE_DETAIL_PAGE_URL_QUERY_KEY,
} from '@/services/asset-inventory-v1/constants/cloud-service-constant';
import type { Period } from '@/services/asset-inventory-v1/types/type';



type CloudServiceMainPageUrlQueryKey = typeof CLOUD_SERVICE_MAIN_PAGE_URL_QUERY_KEY[number];
type CloudServiceDetailPageUrlQueryKey = typeof CLOUD_SERVICE_DETAIL_PAGE_URL_QUERY_KEY[number];

export type CloudServiceMainPageUrlQuery = Partial<Record<CloudServiceMainPageUrlQueryKey, RouteQueryString>>;
export type CloudServiceDetailPageUrlQuery = Partial<Record<CloudServiceDetailPageUrlQueryKey, RouteQueryString>>;

export type CloudServiceCategory = typeof CLOUD_SERVICE_CATEGORY[keyof typeof CLOUD_SERVICE_CATEGORY];

export type CloudServiceMainPageUrlQueryValue = {
    provider?: string;
    service?: CloudServiceCategory[];
    region?: string[];
    project?: string[];
    service_account?: string[];
    period?: Period;
    filters?: ConsoleFilter[];
};

export type CloudServiceFilterKey = typeof CLOUD_SERVICE_FILTER_KEY[keyof typeof CLOUD_SERVICE_FILTER_KEY];

export type CloudServiceFilterMap = {
    [CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]?: CloudServiceCategory[];
    [CLOUD_SERVICE_FILTER_KEY.REGION]?: string[];
};

export type CloudServiceGlobalFilterMap = {
    [CLOUD_SERVICE_GLOBAL_FILTER_KEY.PROJECT]?: string[];
    [CLOUD_SERVICE_GLOBAL_FILTER_KEY.SERVICE_ACCOUNT]?: string[];
};
