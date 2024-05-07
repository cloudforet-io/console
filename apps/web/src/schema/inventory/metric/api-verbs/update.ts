import type { Tags } from '@/schema/_common/model';


export interface MetricUpdateParameters {
    metric_id: string;
    name?: string;
    query_options?: object;
    unit?: string;
    tags?: Tags;
}
