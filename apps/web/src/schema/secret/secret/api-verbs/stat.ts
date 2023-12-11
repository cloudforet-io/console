import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface SecretStatParameters {
    query: Query
    workspace_id?: string;
}
