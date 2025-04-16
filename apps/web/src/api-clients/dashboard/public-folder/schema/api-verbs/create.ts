import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';


export interface PublicFolderCreateParameters {
    name: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    tags?: Tags;
    dashboards?: string[];
    workspace_id?: string;
    project_id?: string;
    project_group_id?: string;
}
