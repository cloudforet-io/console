import type { Tags } from '@/models';

import type { Currency } from '@/store/modules/settings/type';

export type CostType = 'provider';
export type CostTypes = Partial<Record<CostType, string[]>>;

interface BudgetPlannedLimit {
    date: string;
    limit: number;
}
export const BUDGET_TIME_UNIT = {
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
    TOTAL: 'TOTAL',
} as const;
export type BudgetTimeUnit = typeof BUDGET_TIME_UNIT[keyof typeof BUDGET_TIME_UNIT];
export const BUDGET_NOTIFICATIONS_UNIT = {
    PERCENT: 'PERCENT',
    ACTUAL_COST: 'ACTUAL_COST',
} as const;
type BudgetNotificationsUnit = typeof BUDGET_NOTIFICATIONS_UNIT[keyof typeof BUDGET_NOTIFICATIONS_UNIT];
export const BUDGET_NOTIFICATIONS_TYPE = {
    CRITICAL: 'CRITICAL',
    WARNING: 'WARNING',
} as const;
type BudgetNotificationsType = typeof BUDGET_NOTIFICATIONS_TYPE[keyof typeof BUDGET_NOTIFICATIONS_TYPE];

export interface BudgetNotifications {
    threshold: number;
    unit: BudgetNotificationsUnit;
    notification_type: BudgetNotificationsType;
}


interface ProviderFilter {
    providers: string[];
    state: 'ENABLED' | 'DISABLED';
}

export interface BudgetModel {
    budget_id: string;
    name: string;
    project_id?: string;
    project_group_id?: string;
    limit: number;
    planned_limits: BudgetPlannedLimit[];
    currency: Currency;
    provider_filter: ProviderFilter;
    time_unit: BudgetTimeUnit;
    start: string;
    end: string;
    notifications: BudgetNotifications[];
    tags: Tags;
    data_source_id: string;
    created_at: string;
    updated_at: string;
    domain_id?: string;
    cost_types?: CostTypes;
}

export interface BudgetUsageModel {
    budget_id: string;
    name: string;
    date: string;
    cost: number;
    usage: number;
    limit: number;
    cost_types?: Partial<Record<CostType, string[]>>;
    project_id?: string;
    project_group_id?: string;
    data_source_id: string;
    updated_at: string;
}

export interface BudgetUsageAnalyzeModel {
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
