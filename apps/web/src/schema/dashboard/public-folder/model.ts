import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';

export interface PublicFolderModel {
    folder_id: string;
    name: string;
    shared: boolean;
    //
    tags: Tags;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
