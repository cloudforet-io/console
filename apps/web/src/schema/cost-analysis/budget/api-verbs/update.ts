import type { Tags } from '@/api-clients/_common/schema/model';
import type { BudgetPlannedLimit } from '@/schema/cost-analysis/budget/type';

export interface BudgetUpdateParameters {
    budget_id: string;
    name?: string;
    limit?: number;
    planned_limits?: BudgetPlannedLimit[];
    tags?: Tags;
}
