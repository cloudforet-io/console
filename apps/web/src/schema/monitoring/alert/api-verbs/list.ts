import type { AlertSeverity, AlertState, AlertUrgency } from '@/schema/monitoring/alert/model';

export interface AlertListParameters {
    alert_number?: number;
    alert_id?: string;
    title?: string;
    state?: AlertState;
    assignee?: string;
    urgency?: AlertUrgency;
    severity?: AlertSeverity;
    resource_id?: string;
    provider?: string;
    account?: string;
    triggered_by?: string;
    webhook_id?: string;
    escalation_policy_id?: string;
    workspace_id?: string;
    project_id?: string;
}
