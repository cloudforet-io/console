import type { METRIC_TYPE } from '@/api-clients/inventory/metric/schema/constant';


export type MetricType = typeof METRIC_TYPE[keyof typeof METRIC_TYPE];

export interface MetricLabelKey {
    key: string;
    name: string;
    search_key?: string;
    default?: boolean;
    reference?: {
        resource_type: string;
        reference_key: string;
    }
}
