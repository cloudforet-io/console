import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type {
    AlertResourcesType,
    AlertSeverityType,
    AlertStatusType, AlertTriggeredType,
    AlertUrgencyType,
} from '@/api-clients/alert-manager/alert/schema/type';

export interface AlertListParameters {
    query?: Query;
    alert_id?: string;
    status?: AlertStatusType;
    urgency?: AlertUrgencyType;
    severity?: AlertSeverityType;
    resources?: AlertResourcesType[];
    triggered_type?: AlertTriggeredType;
    triggered_by?: string;
    asset_id?: string;
    webhook_id?: string;
    escalation_policy_id?: string;
    service_id?: string;
    workspace_id?: string;
}
