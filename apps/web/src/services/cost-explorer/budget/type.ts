import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { RouteQueryString } from '@/lib/router-query-string';

import type { Granularity } from '@/services/cost-explorer/type';


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
	query: {
		group_by?: string[];
		granularity?: Granularity;
		start?: string;
		end?: string;
		fields?: Record<string, any>;
		select?: Record<string, any>;
		sort?: Array<Query['sort']>;
		page?: Query['page'];
		filter?: Query['filter'];
	}
}
