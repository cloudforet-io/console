import { Tags, TimeStamp } from '@/models';

export type BudgetCostType = 'all'| 'provider'| 'region_code'| 'account'| 'product'

interface BudgetPlannedLimit {
	date: string;
	limit: number;
}

interface BudgetMonthlyCost {
	date: string;
	usd_cost: number|string;
}

export type CostType = 'provider' | 'region_code' | 'account' | 'product'

export type BudgetTimeUnit = 'MONTHLY' | 'YEARLY' | 'TOTAL'

export const BUDGET_NOTIFICATIONS_UNIT = Object.freeze({
    PERCENT: 'PERCENT',
    ACTUAL_COST: 'ACTUAL_COST',
} as const);

export type BUDGET_NOTIFICATIONS_UNIT = typeof BUDGET_NOTIFICATIONS_UNIT[keyof typeof BUDGET_NOTIFICATIONS_UNIT];

export const BUDGET_NOTIFICATIONS_TYPE = Object.freeze({
    CRITICAL: 'CRITICAL',
    WARNING: 'WARNING',
} as const);

export type BUDGET_NOTIFICATIONS_TYPE = typeof BUDGET_NOTIFICATIONS_TYPE[keyof typeof BUDGET_NOTIFICATIONS_TYPE];

export interface BudgetNotifications {
	threshold: number;
	unit: BUDGET_NOTIFICATIONS_UNIT;
	notification_type: BUDGET_NOTIFICATIONS_TYPE;
}

export interface BudgetData {
	budget_id: string;
	name: string;
	project_id?: string;
	project_group_id?: string;
	limit: number;
	planned_limits: BudgetPlannedLimit[];
	total_usage_usd_cost: number;
	monthly_costs?: BudgetMonthlyCost[];
	cost_types?: Partial<Record<CostType, string[]>>;
	time_unit: BudgetTimeUnit;
	start: string;
	end: string;
	notifications: BudgetNotifications[];
	tags: Tags;
	domain_id?: string;
	created_at: TimeStamp;
	updated_at: TimeStamp;
}
