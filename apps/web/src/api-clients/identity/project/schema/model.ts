import type { Tags } from '@/api-clients/_common/schema/model';
import type { ProjectType } from '@/api-clients/identity/project/schema/type';


export interface ProjectModel {
    project_id: string;
    name: string;
    project_type: ProjectType;
    tags: Tags;
    users: string[];
    user_groups: string[];
    created_by: string;
    project_group_id: string;
    is_managed: boolean;
    reference_id: string;
    trusted_account_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
