import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AlertModel } from '@/api-clients/alert-manager/alert/schema/model';
import type {
    AlertSeverityType, AlertUrgencyType, AlertStatusType,
} from '@/api-clients/alert-manager/alert/schema/type';

export interface AlertListParameters {
    alert_number?: number;
    alert_id?: string;
    title?: string;
    state?: AlertStatusType;
    assignee?: string;
    urgency?: AlertUrgencyType;
    severity?: AlertSeverityType;
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
