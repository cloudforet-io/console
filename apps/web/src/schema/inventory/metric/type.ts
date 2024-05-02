import type { METRIC_TYPE } from '@/schema/inventory/metric/constant';


export type MetricType = typeof METRIC_TYPE[keyof typeof METRIC_TYPE];

export interface MetricLabelKey {
    key: string;
    name: string;
    reference?: {
        resource_type: string;
        reference_key: string;
    }
}
