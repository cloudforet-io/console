import type { BudgetModel } from '@/api-schema/cost-analysis/budget/model';


export interface MonthAmountInput {
    amount?: number;
    isValid?: boolean;
}
export type MonthAmountInputMap = Record<string, MonthAmountInput>;


export interface AutofillOptions {
    start?: number;
    growth?: number;
}

export interface BudgetAmountPlanInfo {
    limit?: BudgetModel['limit'];
    planned_limits?: BudgetModel['planned_limits'];
    time_unit: BudgetModel['time_unit'];
    start: BudgetModel['start'];
    end: BudgetModel['end'];
}
