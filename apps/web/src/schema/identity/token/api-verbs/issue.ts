import type { AuthType } from '@/schema/identity/user/type';


export interface TokenIssueParameters {
    credentials?: Record<string, any>;
    auth_type: AuthType;
    timeout?: number;
    verify_code?: string;
    domain_id?: string;
}
