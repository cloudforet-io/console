import type { GrantScope, GrantType } from '@/api-clients/identity/token/schema/type';

export interface TokenGrantParameters {
    grant_type: GrantType;
    token: string;
    scope: GrantScope;
    timeout?: number;
    workspace_id?: string;
}
