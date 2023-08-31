import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { RouteQueryString } from '@/lib/router-query-string';

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
	limit?: BudgetModel['limit'];
	planned_limits?: BudgetModel['planned_limits'];
	time_unit: BudgetModel['time_unit'];
	start: BudgetModel['start'];
	end: BudgetModel['end'];
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

export type BudgetBaseInfo = Pick<BudgetModel, 'name'|'cost_types'|'project_group_id'|'project_id'>;


