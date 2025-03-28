import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import type {
    AlertSeverity, AlertState, AlertUrgency,
} from '@/schema/monitoring/alert/type';

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
    query?: Query;
}

export type AlertListResponse = ListResponse<AlertModel>;
