import type { RouteQueryString } from '@/lib/router-query-string';

export type SignInPageQuery = Partial<Record<'previousPath'|'redirectPath', RouteQueryString>>;

export interface SignInPageQueryValue {
    previousPath?: string;
    redirectPath?: string;
    error?: boolean;
}
