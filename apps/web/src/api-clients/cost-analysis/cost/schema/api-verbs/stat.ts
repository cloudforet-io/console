import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface CostStatParameters {
    data_source_id?: string;
    query: Query;
}
