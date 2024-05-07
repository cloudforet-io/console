import type { Tags } from '@/schema/_common/model';


export interface MetricExampleUpdateParameters {
    example_id: string;
    name?: string;
    options?: object;
    tags?: Tags;
}
