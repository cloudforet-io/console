import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { RoleType } from '@/schema/identity/role/type';

export interface RoleListRequestParameters {
    query?: Query;
    role_binding_id?: string;
    user_id?: string;
    role_id?: string;
    role_type?: RoleType;
    workspace_id?: string;
}
