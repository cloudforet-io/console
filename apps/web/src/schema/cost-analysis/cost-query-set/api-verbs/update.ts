import type { Tags } from '@/schema/_common/model';
import type { CostQuerySetOption } from '@/schema/cost-analysis/cost-query-set/type';


export interface CostQuerySetUpdateParameters {
    cost_query_set_id: string;
    name?: string;
    options?: CostQuerySetOption;
    tags?: Tags;
}
