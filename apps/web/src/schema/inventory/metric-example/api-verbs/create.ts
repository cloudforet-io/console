import type { Tags } from '@/schema/_common/model';


export interface MetricExampleCreateParameters {
    metric_id: string;
    name?: string;
    options: object;
    tags?: Tags;
}
