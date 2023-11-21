import type { Tags } from '@/api-schema/common/model';

import type { Currency } from '@/store/modules/settings/type';


type BudgetTimeUnit = 'MONTHLY' | 'YEARLY' | 'TOTAL';
type BudgetNotificationType = 'CRITICAL' | 'WARNING';
type BudgetNotificationUnit = 'PERCENT' | 'ACTUAL_COST';

interface BudgetNotification {
    threshold: number;
    unit: BudgetNotificationUnit;
    notification_type: BudgetNotificationType;
}
interface BudgetPlannedLimit {
    date: string;
    limit: number;
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
}
