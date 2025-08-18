import type { MONITORING_TYPE } from '@/api-clients/monitoring/data-source/schema/constants';

export type MonitoringType = typeof MONITORING_TYPE[keyof typeof MONITORING_TYPE];
