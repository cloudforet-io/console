import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface BudgetUsageListParameters {
    query?: Query;
    name?: string;
    date?: string;
    budget_id?: string;
    data_source_id?: string;
    workspace_id?: string;
    project_id?: string;
    service_account_id?: string;
}
