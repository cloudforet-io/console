import type { StatQuery } from '@/api-clients/_common/schema/type';

export interface CostStatParameters {
    data_source_id?: string;
    query: StatQuery;
}
