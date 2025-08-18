import type { Tags } from '@/api-clients/_common/schema/model';


export interface MetricExampleCreateParameters {
    metric_id: string;
    name?: string;
    options: object;
    tags?: Tags;
}
