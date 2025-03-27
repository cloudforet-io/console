import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { AppStatusType } from '@/api-clients/identity/app/schema/type';
import type { RoleType } from '@/api-clients/identity/role/type';

export interface AppModel {
    app_id: string;
    client_secret?: string;
    name: string;
    state: AppStatusType;
    role_type: RoleType;
    client_id: string;
    role_id: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'>;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    last_accessed_at: string;
    expired_at: string;
    tags?: Tags;
    project_group_id?: string;
    project_id?: string;
}

