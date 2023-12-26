import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { AppStatusType } from '@/schema/identity/app/type';
import type { RoleType } from '@/schema/identity/role/type';

export interface AppModel {
    app_id: string;
    api_key?: string;
    name: string;
    state: AppStatusType;
    role_type: RoleType;
    api_key_id: string;
    role_id: string;
    resource_group: ResourceGroupType;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    last_accessed_at: string;
    expired_at: string;
    tags?: Tags;
}

