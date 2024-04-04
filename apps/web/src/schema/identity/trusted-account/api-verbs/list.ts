import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface TrustedAccountListParameters {
    query?: Query;
    trusted_account_id?: string;
    name?: string;
    provider?: string;
    workspace_id?: string;
    secret_schema_id?: string;
    trusted_secret_id?: string;
}
