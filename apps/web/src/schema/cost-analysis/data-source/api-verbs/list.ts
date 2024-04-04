import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { CostDataSourceState, CostDataSourceType } from '@/schema/cost-analysis/data-source/type';


export interface CostDataSourceListParameters {
    query?: Query;
    data_source_id?: string;
    name?: string;
    state?: CostDataSourceState;
    data_source_type?: CostDataSourceType;
    provider?: string;
    workspace_id?: string;
}
