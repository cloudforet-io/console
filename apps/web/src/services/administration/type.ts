import type { TimeStamp } from '@/models';

import type { RoleData } from '@/services/administration/iam/role/type';
import type { ProjectGroupInfo, ProjectModel } from '@/services/project/type';

export interface RoleBindingType {
    created_at: TimeStamp;
    domain_id: string;
    labels?: string[];
    project_group_info?: ProjectGroupInfo | undefined;
    project_info?: ProjectModel | undefined;
    resource_id: string;
    resource_type: string;
    role_binding_id: string;
    role_info: RoleData;
    tags: { description: string };
}
