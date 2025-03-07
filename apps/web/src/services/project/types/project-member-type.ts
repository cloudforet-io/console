
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';
import type { ProjectModel } from '@/schema/identity/project/model';
import type { RoleModel } from '@/schema/identity/role/model';


export interface ProjectMemberItem {
    resource_id: string;
    project_info?: ProjectModel;
    project_group_info?: ProjectGroupModel;
    role_info?: RoleModel;
    labels?: string[];
}
