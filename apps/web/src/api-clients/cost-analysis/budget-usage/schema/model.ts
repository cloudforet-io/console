import type { ResourceGroupType } from '@/api-clients/_common/schema/type';

import type { Currency } from '@/store/display/type';


// interface ProviderFilter {
//     providers: string[];
//     state: 'ENABLED' | 'DISABLED';
// }

export interface BudgetUsageModel {
    budget_id: string;
    name: string;
    date: string;
    cost: number;
    limit: number;
    currency: Currency;
    data_source_id: string;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE'|'PROJECT'>;
    project_id: string;
    workspace_id: string;
    service_account_id: string;
    domain_id: string;
    updated_at: string;
}
