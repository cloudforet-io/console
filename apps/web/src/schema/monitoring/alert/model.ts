import type { TimeStamp } from '@/schema/_common/model';
import type { ALERT_STATE, ALERT_URGENCY } from '@/schema/monitoring/alert/constants';


type Responder = {
    resource_type: string;
    resource_id: string;
};

interface Resource {
    resource_id?: string;
    resource_type?: string;
    name?: string;
    ip_address?: string;
}

export type AlertSeverity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'NOT_AVAILABLE' | 'NONE';
export type AlertState = typeof ALERT_STATE[keyof typeof ALERT_STATE];
export type AlertUrgency = typeof ALERT_URGENCY[keyof typeof ALERT_URGENCY];

export interface AlertModel {
    alert_number: number;
    alert_id: string;
    title: string;
    state: AlertState;
    status_message: string;
    description: string;
    assignee: string;
    urgency: AlertUrgency;
    severity: AlertSeverity;
    rule: string;
    resource: Resource;
    additional_info: any;
    escalation_step: number;
    escalation_ttl: number;
    responders: Responder[];
    project_dependencies: string[];
    triggered_by: string;
    webhook_id: string;
    escalation_policy_id: string;
    project_id: string;
    domain_id: string;
    //
    created_at: TimeStamp;
    updated_at: TimeStamp;
    acknowledged_at: TimeStamp;
    resolved_at: TimeStamp;
    escalated_at: TimeStamp;
}
