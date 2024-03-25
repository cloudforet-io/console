import type { METRIC_TYPE } from '@/schema/inventory/metric/constant';


export type MetricType = typeof METRIC_TYPE[keyof typeof METRIC_TYPE];
