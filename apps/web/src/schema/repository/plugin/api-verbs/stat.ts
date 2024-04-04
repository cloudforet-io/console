import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface PluginStatParameters {
    query: Query;
    repository_id?: string;
}
