import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type {
    BudgetNotification, BudgetPlannedLimit, BudgetTimeUnit,
} from '@/api-clients/cost-analysis/budget/schema/type';

import type { Currency } from '@/store/display/type';

export interface BudgetCreateParameters {
    name?: string;
    limit?: number;
    planned_limits?: BudgetPlannedLimit[];
    currency: Currency;
    time_unit: BudgetTimeUnit;
    start: string;
    end: string;
    notification?: BudgetNotification;
    tags?: Tags;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE'|'PROJECT'>;
    workspace_id?: string;
    project_id?: string;
    service_account_id?: string;
    budget_manager_id?: string;
}
