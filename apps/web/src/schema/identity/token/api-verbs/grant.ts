import type { GrantScope, GrantType } from '@/schema/identity/token/type';

export interface TokenGrantParameters {
    grant_type: GrantType;
    scope: GrantScope;
    token: string;
    workspace_id?: string;
}
