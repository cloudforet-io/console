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
    project_id?: string;
    project_group_id?: string;
    data_source_id: string;
    domain_id: string;
    updated_at: string;
}
