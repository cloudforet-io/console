import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { CostDataSourceState, CostDataSourceType } from '@/api-clients/cost-analysis/data-source/schema/type';


export interface CostDataSourceListParameters {
    query?: Query;
    data_source_id?: string;
    name?: string;
    state?: CostDataSourceState;
    data_source_type?: CostDataSourceType;
    provider?: string;
    workspace_id?: string;
    connected_workspace_id?: string;
}
