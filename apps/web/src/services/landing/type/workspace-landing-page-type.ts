import type { RouteQueryString } from '@/lib/router-query-string';

export type WorkspaceLandingPageQuery = Partial<Record<'previousPath', RouteQueryString>>;

export interface WorkspaceLandingPageQueryValue {
    redirectPath?: string;
}
