import type { Tags } from '@/schema/_common/model';


export interface MetricExampleModel {
    example_id: string;
    name: string;
    options: object;
    tags: Tags;
    metric_id: string;
    user_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
