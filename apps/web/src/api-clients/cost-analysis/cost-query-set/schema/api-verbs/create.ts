import type { Tags } from '@/api-clients/_common/schema/model';
import type { CostQuerySetOption } from '@/api-clients/cost-analysis/cost-query-set/schema/type';


export interface CostQuerySetCreateParameters {
    data_source_id: string;
    name: string;
    options: CostQuerySetOption;
    tags?: Tags;
}
