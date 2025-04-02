import type { RouteQueryString } from '@/lib/router-query-string';

export interface ProjectNotificationAddPageUrlQuery {
    protocolLabel?: RouteQueryString;
    protocolType?: RouteQueryString;
}

export interface ProjectNotificationAddPageUrlQueryValue {
    protocolLabel?: string;
    protocolType?: string;
}
