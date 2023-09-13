import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

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
