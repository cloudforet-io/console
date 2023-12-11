import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { PermissionGroup } from '@/schema/identity/role-binding/type';

export interface TrustedSecretListParameters {
    query?: Query
    trusted_secret_id?: string;
    name?: string;
    schema_id?: string;
    provider?: string;
    trusted_account_id?: string,
    permission_group?: PermissionGroup,
    workspace_id?: string,
}
