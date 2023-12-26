import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ResourceGroupType } from '@/schema/_common/type';

export interface SecretListParameters {
    query?: Query;
    secret_id?: string;
    name?: string;
    schema_id?: string;
    provider?: string;
    service_account_id?: string;
    trusted_secret_id?: string;
    resource_group?: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    workspace_id?: string;
}
