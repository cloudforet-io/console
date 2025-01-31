import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface CostDataSourceAccountListParameters {
    query?: Query;
    data_source_id?: string;
    account_id?: string;
    service_account_id?: string;
    project_id?: string;
    workspace_id?: string;
}
