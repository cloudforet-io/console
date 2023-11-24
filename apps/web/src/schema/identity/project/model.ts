import type { Tags, TimeStamp } from '@/schema/_common/model';


type ProjectType = 'PRIVATE' | 'PUBLIC';
export interface ProjectModel {
    project_id: string;
    name: string;
    project_type: ProjectType;
    tags: Tags;
    users: string[];
    user_groups: string[];
    project_group_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: TimeStamp;
}
