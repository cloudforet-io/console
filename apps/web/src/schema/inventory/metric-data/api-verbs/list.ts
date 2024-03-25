import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface MetricDataListParameters {
    metric_id: string;
    query?: Query;
    namespace_id?: string;
    workspace_id?: string;
    project_id?: string;
}
