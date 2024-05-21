import type { Tags } from '@/schema/_common/model';
import type { MetricType, MetricLabelKey } from '@/schema/inventory/metric/type';


export interface MetricModel {
    metric_id: string;
    name: string;
    metric_type: MetricType;
    resource_type: string;
    query_options: Record<string, any>;
    date_field: string;
    unit: string;
    tags: Tags;
    labels_info: MetricLabelKey[];
    is_managed: boolean;
    namespace_id: string;
    domain_id: string;
    workspace_id: string;
    created_at: string;
    updated_at: string;
}
