import type { Tags } from '@/schema/_common/model';
import type { CostQuerySetOption } from '@/schema/cost-analysis/cost-query-set/type';


export interface CostQuerySetCreateParameters {
    data_source_id: string;
    name: string;
    options: CostQuerySetOption;
    tags?: Tags;
}
