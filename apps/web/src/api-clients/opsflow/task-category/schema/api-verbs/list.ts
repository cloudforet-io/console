import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface TaskCategoryListParameters {
    query?: Query;
    category_id?: string;
    name?: string;
    include_deleted?: boolean;
}
