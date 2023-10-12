import type { RouteQueryString } from '@/lib/router-query-string';

import type { RoleData } from '@/services/administration/iam/role/type';
import type { ProjectGroupInfo, ProjectModel } from '@/services/project/type';

export type ProjectMemberPageUrlQuery = Partial<Record<'filters', RouteQueryString>>;

export interface MemberItem {
    resource_id: string;
    project_info?: ProjectModel;
    project_group_info?: ProjectGroupInfo;
    role_info?: RoleData;
    labels?: string[];
}

export const AUTH_TYPE = Object.freeze({
    INTERNAL_USER: 'INTERNAL_USER',
    KEYCLOAK: 'KEYCLOAK',
    GOOGLE_OAUTH2: 'GOOGLE_OAUTH2',
});
