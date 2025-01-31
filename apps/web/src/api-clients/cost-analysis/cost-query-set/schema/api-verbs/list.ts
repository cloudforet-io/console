import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface CostQuerySetListParameters {
    data_source_id: string;
    query?: Query;
    name?: string;
}
