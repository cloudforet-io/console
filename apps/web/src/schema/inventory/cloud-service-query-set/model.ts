import type { TimeStamp } from '@/api-schema/common/model';
import type { RoleModel } from '@/api-schema/identity/role/model';

import type { ProjectGroupInfo, ProjectModel } from '@/services/project/type';

export interface RoleBindingModel {
    created_at: TimeStamp;
    domain_id: string;
    labels?: string[];
    project_group_info?: ProjectGroupInfo | undefined;
    project_info?: ProjectModel | undefined;
    resource_id: string;
    resource_type: string;
    role_binding_id: string;
    role_info: RoleModel;
    tags: { description: string };
}
