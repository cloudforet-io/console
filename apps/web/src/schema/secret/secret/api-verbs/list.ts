import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface SecretListParameters {
    query?: Query;
    secret_id?: string;
    name?: string;
    schema_id?: string;
    provider?: string;
    workspace_id?: string;
    project_id?: string;
    trusted_secret_id?: string;
    service_account_id?: string;
}
