import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';


export interface PublicFolderCreateParameters {
    name: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    tags?: Tags;
    dashboards?: string[];
    workspace_id?: string;
    project_id?: string;
}
