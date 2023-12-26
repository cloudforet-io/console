import type { MONITORING_TYPE } from '@/schema/monitoring/data-source/constant';

export type MonitoringType = typeof MONITORING_TYPE[keyof typeof MONITORING_TYPE];
