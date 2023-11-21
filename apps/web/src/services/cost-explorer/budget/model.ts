import type { Tags } from '@/api-schema/common/model';

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
type BudgetNotificationUnit = typeof BUDGET_NOTIFICATIONS_UNIT[keyof typeof BUDGET_NOTIFICATIONS_UNIT];
export const BUDGET_NOTIFICATIONS_TYPE = {
    CRITICAL: 'CRITICAL',
    WARNING: 'WARNING',
} as const;
type BudgetNotificationType = typeof BUDGET_NOTIFICATIONS_TYPE[keyof typeof BUDGET_NOTIFICATIONS_TYPE];

export interface BudgetNotification {
    threshold: number;
    unit: BudgetNotificationUnit;
    notification_type: BudgetNotificationType;
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
    notifications: BudgetNotification[];
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
    limit: number;
    currency: Currency;
    provider_filter?: ProviderFilter;
    project_id?: string;
    project_group_id?: string;
    data_source_id: string;
    domain_id: string;
    updated_at: string;
}
