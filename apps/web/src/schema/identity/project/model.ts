import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';


export interface ProjectModel {
    project_id: string;
    name: string;
    tags: Tags;
    project_group_info: ProjectGroupModel;
    domain_id: string;
    created_by: string;
    created_at: TimeStamp;
}
