import type { Tags } from '@/schema/_common/model';
import type {
    BudgetNotification, BudgetPlannedLimit, BudgetTimeUnit, ProviderFilter,
} from '@/schema/cost-analysis/budget/type';
import type { ResourceGroup } from '@/schema/identity/role-binding/type';

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
    resource_group: ResourceGroup;
    workspace_id?: string;
    project_id?: string;
}
