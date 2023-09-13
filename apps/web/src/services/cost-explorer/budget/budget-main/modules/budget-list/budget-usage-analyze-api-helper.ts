import { isEmpty } from 'lodash';

import type { Query } from '@cloudforet/core-lib/space-connector/type';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import type { Period } from '@/services/cost-explorer/type';

interface BudgetUsageAnalyzeResult {
    budget_id: string;
    budget_usage: number;
    total_budget: number;
    total_spent: number;
    name?: string;
    project_id?: string;
    project_group_id?: string;
    data_source_id?: string;
    provider_filter?: {
        state?: string;
        providers?: string[];
    };
}

type BudgetUsageAnalyzeRequestGroupBy = Partial<keyof BudgetUsageAnalyzeResult>;
const BUDGET_USAGE_ANALYZE_REQUEST_GROUP_BY: BudgetUsageAnalyzeRequestGroupBy[] = [
    'budget_id', 'name', 'project_id', 'project_group_id', 'data_source_id', 'provider_filter',
];

type BudgetUsageAnalyzeRequestSelect = Record<BudgetUsageAnalyzeRequestGroupBy, any>;
const BUDGET_USAGE_ANALYZE_REQUEST_SELECT: BudgetUsageAnalyzeRequestSelect = {
    budget_id: 'budget_id',
    name: 'name',
    project_id: 'project_id',
    project_group_id: 'project_group_id',
    data_source_id: 'data_source_id',
    provider_filter: 'provider_filter',
    total_spent: 'total_spent',
    total_budget: 'total_budget',
    budget_usage: 'budget_usage',
};

export const getBudgetUsageAnalyzeRequestQuery = (sort: Query['sort'], period?: Period) => {
    const query: any = {
        group_by: BUDGET_USAGE_ANALYZE_REQUEST_GROUP_BY,
        fields: {
            total_spent: {
                key: 'cost',
                operator: 'sum',
            },
            total_budget: {
                key: 'limit',
                operator: 'sum',
            },
        },
        select: {
            ...BUDGET_USAGE_ANALYZE_REQUEST_SELECT,
            budget_usage: {
                operator: 'multiply',
                fields: [
                    {
                        operator: 'divide',
                        fields: [
                            'total_spent',
                            'total_budget',
                        ],
                    },
                    100,
                ],
            },
        },
        sort: [sort],
    };

    if (!isEmpty(period)) {
        query.granularity = GRANULARITY.MONTHLY;
        query.start = period?.start;
        query.end = period?.end;
    }

    return query;
};
