import type { ALERT_STATE, ALERT_URGENCY } from '@/api-clients/monitoring/alert/schema/constants';

export interface AlertResource {
    resource_id?: string;
    resource_type?: string;
    name?: string;
}

export type AlertSeverity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'NOT_AVAILABLE' | 'NONE';
export type AlertState = typeof ALERT_STATE[keyof typeof ALERT_STATE];
export type AlertUrgency = typeof ALERT_URGENCY[keyof typeof ALERT_URGENCY];
