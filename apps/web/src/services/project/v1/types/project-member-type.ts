
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';


export interface ProjectMemberItem {
    resource_id: string;
    project_info?: ProjectModel;
    project_group_info?: ProjectGroupModel;
    role_info?: RoleModel;
    labels?: string[];
}
