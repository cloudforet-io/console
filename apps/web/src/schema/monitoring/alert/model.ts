import type { ALERT_STATE, ALERT_URGENCY } from '@/schema/monitoring/alert/constants';

interface AlertResource {
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
    description: string;
    assignee: string;
    urgency: AlertUrgency;
    severity: AlertSeverity;
    rule: string;
    image_url: string;
    resource: AlertResource;
    provider: string;
    account: string;
    additional_info: Record<string, any>;
    escalation_step: number;
    escalation_ttl: number;
    triggered_by: string;
    webhook_id: string;
    escalation_policy_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    //
    created_at: string;
    updated_at: string;
    acknowledged_at: string;
    resolved_at: string;
    escalated_at: string;
}
