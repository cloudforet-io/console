import type { RouteQueryString } from '@/lib/router-query-string';

export interface UserNotificationAddPageUrlQuery {
    protocolLabel?: RouteQueryString;
    protocolType?: RouteQueryString;
}

export interface UserNotificationAddPageUrlQueryValue {
    protocolLabel?: string;
    protocolType?: string;
}
