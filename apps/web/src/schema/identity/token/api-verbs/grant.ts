import type { GrantScope, GrantType } from '@/schema/identity/token/type';

export interface TokenGrantParameters {
    grant_type: GrantType;
    token: string;
    scope: GrantScope;
    timeout?: number;
    workspace_id?: string;
}
