import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface ProjectAlertConfigListParameters {
    project_id?: string;
    escalation_policy_id?: string;
    query?: Query;
}
