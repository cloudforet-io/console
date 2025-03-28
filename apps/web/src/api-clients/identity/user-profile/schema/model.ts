import type { Tags } from '@/api-clients/_common/schema/model';
import type { UserState } from '@/api-clients/identity/user/schema/type';

export interface MyWorkspaceModel {
    workspace_id: string;
    name: string;
    state: string;
    role_name: string;
    role_type: string;
    tags: Tags;
    created_by: string;
    reference_id: string;
    is_managed: boolean;
    is_dormant: boolean;
    role_id: string;
    domain_id: string;
    created_at: string;
    last_synced_at: string;
    dormant_updated_at: string;
}

export interface MyWorkspaceGroupModel {
    workspace_group_id: string;
    name: string;
    users: MyWorkspaceUserModel[];
    tags: Tags;
    role_binding_info: any;
    created_by: string;
    updated_by: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}

export interface MyWorkspaceUserModel {
    user_id: string;
    user_name: string;
    role_id: string;
    role_type: string;
    state: UserState;
}
