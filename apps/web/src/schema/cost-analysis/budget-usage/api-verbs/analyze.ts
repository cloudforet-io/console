export interface BudgetUsageAnalyzeResult {
    budget_id: string;
    budget_usage: number;
    total_budget: number;
    total_spent: number;
    name?: string;
    project_id?: string;
    project_group_id?: string;
    data_source_id?: string;
    provider_filter?: {
        state?: string;
        providers?: string[];
    };
}

export interface BudgetUsageAnalyzeResponse {
    results: BudgetUsageAnalyzeResult[];
    more?: boolean;
}
