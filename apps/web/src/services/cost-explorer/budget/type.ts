import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { Tags, TimeStamp } from '@/models';

import type { RouteQueryString } from '@/lib/router-query-string';


interface BudgetPlannedLimit {
	date: string;
	limit: number;
}

interface BudgetMonthlyCost {
	date: string;
	usd_cost: number|string;
}

export type CostType = 'provider' | 'region_code' | 'service_account_id' | 'product';

export type BudgetCostType = 'all'| CostType;

export const BUDGET_TIME_UNIT = Object.freeze({
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
    TOTAL: 'TOTAL',
} as const);
export type BudgetTimeUnit = typeof BUDGET_TIME_UNIT[keyof typeof BUDGET_TIME_UNIT];

export const BUDGET_NOTIFICATIONS_UNIT = Object.freeze({
    PERCENT: 'PERCENT',
    ACTUAL_COST: 'ACTUAL_COST',
} as const);

type BudgetNotificationsUnit = typeof BUDGET_NOTIFICATIONS_UNIT[keyof typeof BUDGET_NOTIFICATIONS_UNIT];

export const BUDGET_NOTIFICATIONS_TYPE = Object.freeze({
    CRITICAL: 'CRITICAL',
    WARNING: 'WARNING',
} as const);

type BudgetNotificationsType = typeof BUDGET_NOTIFICATIONS_TYPE[keyof typeof BUDGET_NOTIFICATIONS_TYPE];

export interface BudgetNotifications {
	threshold: number;
	unit: BudgetNotificationsUnit;
	notification_type: BudgetNotificationsType;
}

export type CostTypes = Partial<Record<CostType, string[]>>;

export interface BudgetData {
	budget_id: string;
	name: string;
	project_id?: string;
	project_group_id?: string;
	limit: number;
	planned_limits: BudgetPlannedLimit[];
	total_usage_usd_cost: number;
	monthly_costs?: BudgetMonthlyCost[];
	cost_types?: CostTypes;
	time_unit: BudgetTimeUnit;
	start: string;
	end: string;
	notifications: BudgetNotifications[];
	tags: Tags;
	domain_id?: string;
	created_at: TimeStamp;
	updated_at: TimeStamp;
}

export interface BudgetUsageData {
	budget_id: string;
	name: string;
	limit: number;
	usd_cost: number;
	date: string;
	domain_id?: string;
	updated_at: TimeStamp;
	usage?: number;
	project_id?: string;
	project_group_id?: string;
	cost_types?: Partial<Record<CostType, string[]>>;
}

export type BudgetPageUrlQuery = Partial<Record<'filters', RouteQueryString>>;

export interface BudgetPageQueryValue {
	filters?: ConsoleFilter[];
}

export interface BudgetUsageRange {
	min?: number;
	max?: number;
	condition?: 'or'|'and'; // default: 'and'
}

export interface BudgetUsageAnalyzeRequestParam {
	include_budget_count?: boolean;
	group_by?: string[];
	start?: string;
	end?: string;
	usage_range?: BudgetUsageRange;
	sort?: Query['sort'];
	page?: Query['page'];
	filter?: Query['filter'];
	keyword?: Query['keyword'];
}

export interface Pagination {
	pageStart: number;
	pageLimit: number;
}

// budget-form types
export interface BudgetAmountPlanInfo {
	limit?: BudgetData['limit'];
	planned_limits?: BudgetData['planned_limits'];
	time_unit: BudgetData['time_unit'];
	start: BudgetData['start'];
	end: BudgetData['end'];
}

export interface AutofillOptions {
	start?: number;
	growth?: number;
}

export interface MonthAmountInput {
	amount?: number;
	isValid?: boolean;
}

export type MonthAmountInputMap = Record<string, MonthAmountInput>;

export type BudgetBaseInfo = Pick<BudgetData, 'name'|'cost_types'|'project_group_id'|'project_id'>;
