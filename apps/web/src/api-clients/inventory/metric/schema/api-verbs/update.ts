import type { Tags } from '@/api-clients/_common/schema/model';


export interface MetricUpdateParameters {
    metric_id: string;
    name?: string;
    query_options?: object;
    unit?: string;
    tags?: Tags;
}
