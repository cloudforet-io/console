import type { TimeStamp } from '@/schema/_common/model';
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';
import type { ProjectModel } from '@/schema/identity/project/model';
import type { RoleModel } from '@/schema/identity/role/model';

export interface RoleBindingModel {
    created_at: TimeStamp;
    domain_id: string;
    labels?: string[];
    project_group_info?: ProjectGroupModel | undefined;
    project_info?: ProjectModel | undefined;
    resource_id: string;
    resource_type: string;
    role_binding_id: string;
    role_info: RoleModel;
    tags: { description: string };
}
