import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ResourceGroupType } from '@/api-clients/_common/schema/type';


export interface BudgetUsageAnalyzeParameters {
    budget_id?: string;
    data_source_id?: string;
    query?: Query;
}

export interface BudgetUsageAnalyzeResult {
    budget_id: string;
    budget_usage: number;
    total_budget: number;
    total_spent: number;
    name?: string;
    project_id?: string;
    workspace_id?: string;
    data_source_id?: string;
    // provider_filter?: {
    //     state?: string;
    //     providers?: string[];
    // };
    resource_group: Extract<ResourceGroupType, 'WORKSPACE' | 'PROJECT'>;
}
