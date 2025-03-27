import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import type { RoleType } from '@/api-clients/identity/role/type';

export interface RoleBindingListParameters {
    query?: Query;
    role_binding_id?: string;
    user_id?: string;
    role_id?: string;
    role_type?: RoleType;
    workspace_id?: string;
}

export type RoleBindingListResponse = ListResponse<RoleBindingModel>;
