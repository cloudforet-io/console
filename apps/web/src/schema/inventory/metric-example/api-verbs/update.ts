import type { Tags } from '@/api-clients/_common/schema/model';


export interface MetricExampleUpdateParameters {
    example_id: string;
    name?: string;
    options?: object;
    tags?: Tags;
}
