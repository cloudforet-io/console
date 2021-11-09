import { Tags, TimeStamp } from '@/models';

export type BudgetCostType = 'all'| 'provider'| 'region'| 'account'| 'product'

interface BudgetPlannedLimit {
	date: string;
	limit: number;
}

interface BudgetMonthlyCost {
	date: string;
	usd_cost: number|string;
}

export type CostType = 'provider' | 'region_code' | 'account' | 'product'

type BudgetTimeUnit = 'MONTHLY' | 'YEARLY' | 'TOTAL'

type BudgetNotificationsUnit = 'PERCENT' | 'ACTUAL_COST';

type BudgetNotificationsType = 'CRITICAL' | 'WARNING';

export interface BudgetNotifications {
	threshold: number;
	unit: BudgetNotificationsUnit;
	notification_type: BudgetNotificationsType;
}

export interface BudgetData {
	budget_id: string;
	name: string;
	project_id: string;
	project_group_id?: string;
	limit: number;
	planned_limits: BudgetPlannedLimit[];
	total_usd_cost: number;
	monthly_costs?: BudgetMonthlyCost[];
	cost_types: Record<CostType, string[]>;
	time_unit: BudgetTimeUnit;
	start: string;
	end: string;
	notifications: BudgetNotifications[];
	tags: Tags;
	domain_id?: string;
	created_at: TimeStamp;
	updated_at: TimeStamp;
}
