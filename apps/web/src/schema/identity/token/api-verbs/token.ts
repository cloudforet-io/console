import type { AuthType } from '@/schema/identity/user/type';


export interface TokenTokenParameters {
    credentials?: Record<string, any>;
    auth_type?: AuthType;
    timeout?: number;
    refresh_count?: number;
    verify_code?: string;
    workspace_id?: string;
    domain_id?: string;
}
