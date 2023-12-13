export interface BudgetUsageAnalyzeResult {
    budget_id: string;
    budget_usage: number;
    total_budget: number;
    total_spent: number;
    name?: string;
    project_id?: string;
    workspace_id?: string;
    data_source_id?: string;
    provider_filter?: {
        state?: string;
        providers?: string[];
    };
    permission_group: 'WORKSPACE' | 'DOMAIN';
}

export interface BudgetUsageAnalyzeResponse {
    results: BudgetUsageAnalyzeResult[];
    more?: boolean;
}
