import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type {
    BudgetNotification, BudgetPlannedLimit, BudgetTimeUnit, ProviderFilter,
} from '@/schema/cost-analysis/budget/type';

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
    resource_group: ResourceGroupType;
    workspace_id?: string;
    project_id?: string;
}
