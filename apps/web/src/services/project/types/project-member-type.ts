import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import type { ProjectGroupModel } from '@/schema/identity/project-group/model';
import type { ProjectModel } from '@/schema/identity/project/model';
import type { PagePermission } from '@/schema/identity/role/model';

import type { RoleData } from '@/services/administration/iam/role/type';


export interface ProjectMemberItem {
    resource_id: string;
    project_info?: ProjectModel;
    project_group_info?: ProjectGroupModel;
    role_info?: RoleData;
    labels?: string[];
}

export interface ProjectMemberRoleMenuItem extends SelectDropdownMenuItem {
    pagePermissions: PagePermission[];
}
