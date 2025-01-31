import type { Tags } from '@/api-clients/_common/schema/model';


export interface ProjectGroupModel {
    project_group_id: string;
    name: string;
    tags: Tags;
    users: string[];
    parent_group_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
