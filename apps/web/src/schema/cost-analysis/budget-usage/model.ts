import type { ResourceGroupType } from '@/schema/_common/type';

import type { Currency } from '@/store/modules/settings/type';


interface ProviderFilter {
    providers: string[];
    state: 'ENABLED' | 'DISABLED';
}

export interface BudgetUsageModel {
    budget_id: string;
    name: string;
    date: string;
    cost: number;
    limit: number;
    currency: Currency;
    provider_filter?: ProviderFilter;
    data_source_id: string;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE'|'PROJECT'>;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    updated_at: string;
}
