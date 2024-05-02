import type { Tags } from '@/schema/_common/model';
import type { MetricType } from '@/schema/inventory/metric/type';


export interface MetricCreateParameters {
    name: string;
    metric_type: MetricType;
    resource_type: string;
    query_options: object;
    unit?: string;
    tags?: Tags;
    namespace_id: string;
}
