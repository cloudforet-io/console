import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { RouteQueryString } from '@/lib/router-query-string';

import type { CLOUD_SERVICE_CATEGORY, CLOUD_SERVICE_FILTER_KEY, CLOUD_SERVICE_PAGE_URL_QUERY_KEY } from '@/services/asset-inventory/constants/cloud-service-constant';
import type { Period } from '@/services/asset-inventory/type';

type CloudServicePageUrlQueryKey = typeof CLOUD_SERVICE_PAGE_URL_QUERY_KEY[number];

export type CloudServicePageUrlQuery = Partial<Record<CloudServicePageUrlQueryKey, RouteQueryString>>;

export type CloudServiceCategory = typeof CLOUD_SERVICE_CATEGORY[keyof typeof CLOUD_SERVICE_CATEGORY];

export type CloudServicePageUrlQueryValue = {
    provider?: string;
    service?: CloudServiceCategory[];
    region?: string[];
    period?: Period;
    filters?: ConsoleFilter[];
};

export type CloudServiceFilterKey = typeof CLOUD_SERVICE_FILTER_KEY[keyof typeof CLOUD_SERVICE_FILTER_KEY];

export type CloudServiceFilterMap = {
    [CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]?: CloudServiceCategory[];
    [CLOUD_SERVICE_FILTER_KEY.REGION]?: string[];
};
