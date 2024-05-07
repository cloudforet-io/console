import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface MetricExampleListParameters {
    query?: Query;
    metric_id?: string;
    name?: string;
}
