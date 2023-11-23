import type { TimeStamp } from '@/schema/_common/model';
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';


export interface ProjectModel {
    project_id: string;
    name: string;
    // state: string;
    project_group_info: ProjectGroupModel;
    // providers?: string[];
    created_by: string;
    created_at: TimeStamp;
    tags: any;
}
