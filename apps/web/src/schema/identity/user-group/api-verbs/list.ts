import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface UserGroupListParameters {
    query?: Query;
    user_group_id?: string;
    name?: string;
    user_id?: string;
}
