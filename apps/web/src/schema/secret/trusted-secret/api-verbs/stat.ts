import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface TrustedSecretStatParameters {
    query: Query
    workspace_id?: string;
}
