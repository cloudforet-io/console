import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';


import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { AlertState, AlertUrgency } from '@/schema/monitoring/alert/model';

import type { RouteQueryString } from '@/lib/router-query-string';

import type {
    FINISH_CONDITION, ALERT_STATE_FILTER, ASSIGNED_STATE, SCOPE,
} from '@/services/alert-manager/constants/alert-constant';


export interface Rule {
    notification_level: string;
    escalate_minutes?: number;
}

type FinishCondition = FINISH_CONDITION.acknowledged | FINISH_CONDITION.resolved;
export type ScopeType = typeof SCOPE[keyof typeof SCOPE];
export interface EscalationPolicyDataModel {
    escalation_policy_id: string;
    finish_condition: FinishCondition;
    is_default?: boolean;
    name: string;
    project_id?: string;
    repeat_count: number;
    rules: Rule[];
    scope: ScopeType;
}

export interface Event {
    additional_info: any;
    alert_id: string;
    created_at: TimeStamp;
    description: string;
    event_id: string;
    event_key: string;
    event_type: string;
    occurred_at: TimeStamp;
    project_id: string;
    raw_data: any;
    resource: any;
    rule: string;
    severity: string;
    title: string;
    webhook_id: string;
}

type AlertStateFilter = typeof ALERT_STATE_FILTER[keyof typeof ALERT_STATE_FILTER];
type AssignedState = typeof ASSIGNED_STATE[keyof typeof ASSIGNED_STATE];
export interface AlertBottomFilters {
    state: AlertStateFilter;
    urgency: AlertUrgency;
    assigned: AssignedState;
}

export interface AlertListTableFilters extends AlertBottomFilters {
    filters: ConsoleFilter[];
}

export interface AlertStateUpdateParams {
    alerts: string[];
    state: AlertState;
    assignee?: string;
    note?: string;
}

export type AlertListPageUrlQuery = Partial<Record<'state' | 'urgency' | 'assigned' | 'filters', RouteQueryString>>;

export interface ProjectMember {
    created_at: TimeStamp;
    domain_id?: string;
    labels: string[];
    project_group_info: any;
    project_info?: any;
    resource_id: string;
    resource_type: string;
    role_binding_id?: string;
    role_info?: any;
    tags: Tags;
}
