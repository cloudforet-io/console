import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { RoleType } from '@/schema/identity/role/type';

export interface RoleListParameters {
    query?: Query;
    role_id?: string;
    name?: string;
    role_type?: RoleType;
    user_id?: string;
}
