import type { AuthType } from '@/schema/identity/user/type';


export interface TokenIssueParameters {
    domain_id: string;
    credentials: Record<string, any>;
    auth_type: AuthType;
    timeout?: number;
    refresh_count?: number;
    verify_code?: string;
}
