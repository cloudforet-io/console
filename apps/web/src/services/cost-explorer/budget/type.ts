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
