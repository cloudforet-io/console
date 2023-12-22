import type {
    AlertResource, AlertSeverity, AlertState, AlertUrgency,
} from '@/schema/monitoring/alert/type';

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
