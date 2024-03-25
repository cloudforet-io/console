import type { Tags } from '@/schema/_common/model';
import type { MetricType } from '@/schema/inventory/metric/type';
import type { NamespaceCategory } from '@/schema/inventory/namespace/type';


export interface MetricModel {
    metric_id: string;
    name: string;
    metric_type: MetricType;
    resource_type: string;
    category: NamespaceCategory;
    is_managed: boolean;
    query_options: object;
    unit: string;
    label_keys: string[];
    tags: Tags;
    namespace_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
