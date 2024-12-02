import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { RouteQueryString } from '@/lib/router-query-string';

export type BoardPageQuery = Partial<Record<'categoryId'|'filters', RouteQueryString>>;

export interface BoardPageQueryValue {
    categoryId?: string;
    filters?: ConsoleFilter[];
}
