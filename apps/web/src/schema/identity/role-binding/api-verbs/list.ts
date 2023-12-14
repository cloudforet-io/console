import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { RoleType } from '@/schema/identity/role/type';

export interface RoleBindingListParameters {
    query?: Query;
    role_binding_id?: string;
    user_id?: string;
    role_id?: string;
    role_type?: RoleType;
    workspace_id?: string;
    resource_group?: Extract<ResourceGroupType, 'WORKSPACE'|'DOMAIN'>;
}

export type RoleBindingListResponse = ListResponse<RoleBindingModel>;
