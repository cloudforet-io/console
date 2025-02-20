import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type {
    BudgetNotification, BudgetPlannedLimit, BudgetTimeUnit, ProviderFilter,
} from '@/api-clients/cost-analysis/budget/schema/type';

export interface BudgetCreateParameters {
    data_source_id: string;
    name?: string;
    limit?: number;
    planned_limits?: BudgetPlannedLimit[];
    provider_filter?: ProviderFilter;
    time_unit: BudgetTimeUnit;
    start: string;
    end: string;
    notifications?: BudgetNotification[];
    tags?: Tags;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE'|'PROJECT'>;
    workspace_id?: string;
    project_id?: string;
}
