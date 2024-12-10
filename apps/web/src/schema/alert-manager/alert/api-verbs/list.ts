import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type {
    AlertResourcesType,
    AlertSeverityType,
    AlertStateType, AlertTriggeredType,
    AlertUrgencyType,
} from '@/schema/alert-manager/alert/type';

export interface AlertListParameters {
    query?: Query;
    alert_id?: string;
    state?: AlertStateType;
    urgency?: AlertUrgencyType;
    severity?: AlertSeverityType;
    resources?: AlertResourcesType[];
    provider?: string;
    account?: string;
    triggered_type?: AlertTriggeredType;
    triggered_by?: string;
    webhook_id?: string;
    escalation_policy_id?: string;
    service_id?: string;
    workspace_id?: string;
}
