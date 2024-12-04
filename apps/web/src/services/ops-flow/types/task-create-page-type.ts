import type { RouteQueryString } from '@/lib/router-query-string';

export type TaskCreatePageQuery = Partial<Record<'categoryId'|'taskTypeId', RouteQueryString>>;

export interface TaskCreatePageQueryValue {
    categoryId?: string;
    taskTypeId?: string;
}
