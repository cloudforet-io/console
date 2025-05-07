import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';

export interface PublicFolderModel {
    folder_id: string;
    name: string;
    shared: boolean;
    scope: 'WORKSPACE'|'PROJECT';
    //
    tags: Tags;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    project_id: string;
    project_group_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
