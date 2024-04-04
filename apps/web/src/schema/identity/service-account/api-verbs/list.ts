import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface ServiceAccountListParameters {
    query?: Query;
    service_account_id?: string;
    name?: string;
    provider?: string;
    workspace_id?: string;
    project_id?: string;
    trusted_account_id?: string;
    secret_schema_id?: string;
    secret_id?: string;
}
