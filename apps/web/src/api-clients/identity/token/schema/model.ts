import type { RoleType } from '@/api-clients/identity/role/type';


export interface TokenIssueModel {
    access_token: string;
    refresh_token: string;
}

export interface TokenGrantModel {
    access_token: string;
    role_type: RoleType;
    role_id: string;
    domain_id: string;
    workspace_id: string;
}
