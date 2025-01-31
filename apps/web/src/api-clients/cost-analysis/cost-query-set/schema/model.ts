import type { Tags } from '@/api-clients/_common/schema/model';
import type { CostQuerySetOption } from '@/api-clients/cost-analysis/cost-query-set/schema/type';


export interface CostQuerySetModel {
    cost_query_set_id: string;
    name: string;
    options?: CostQuerySetOption;
    tags: Tags;
    data_source_id: string;
    user_id: string;
    workspace_id?: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
