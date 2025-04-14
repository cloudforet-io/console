import type { Tags } from '@/api-clients/_common/schema/model';
import type { BudgetPlannedLimit } from '@/api-clients/cost-analysis/budget/schema/type';

export interface BudgetUpdateParameters {
    budget_id: string;
    name?: string;
    limit?: number;
    planned_limits?: BudgetPlannedLimit[];
    start?: string;
    end?: string;
    utilization_rate?: number;
    tags?: Tags;
}
