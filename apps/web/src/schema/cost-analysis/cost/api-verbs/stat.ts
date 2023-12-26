import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface CostStateParameters {
    data_source_id?: string;
    query: Query;
}
