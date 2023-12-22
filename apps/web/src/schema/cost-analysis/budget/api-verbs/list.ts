import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { BudgetTimeUnit } from '@/schema/cost-analysis/budget/type';

export interface BudgetListParameters {
    query?: Query
    budget_id?: string;
    name?: string;
    time_unit?: BudgetTimeUnit;
    data_source_id?: string;
    workspace_id?: string;
    project_id?: string;
}
