import type { QueryStoreFilter } from '@cloudforet/core-lib/query/type';

import type { Tags, TimeStamp } from '@/models';

import type { RouteQueryString } from '@/lib/router-query-string';

import type {
    FINISH_CONDITION, SCOPE,
    AlertState, AlertUrgency, AlertSeverity, AlertStateFilter, AssignedState,
} from '@/services/alert-manager/lib/config';

export interface Rule {
    notification_level: string;
    escalate_minutes?: number;
}

export interface EscalationPolicyFormModel {
    name: string;
    rules: Rule[];
    scope: SCOPE.global | SCOPE.project;
    finish_condition: FINISH_CONDITION.acknowledged | FINISH_CONDITION.resolved;
    repeat_count: number;
    project_id?: string;
}

type Responder = {
    resource_type: string;
    resource_id: string;
};

interface ResourceModel {
    resource_id?: string;
    resource_type?: string;
    name?: string;
    ip_address?: string;
}

export interface AlertDataModel {
    responders: Responder[];
    alert_number: number;
    alert_id: string;
    title: string;
    state: AlertState;
    status_message: string;
    description: string;
    assignee: string;
    urgency: AlertUrgency;
    severity: AlertSeverity;
    is_snoozed: true;
    snoozed_end_time: TimeStamp;
    escalation_step: number;
    escalation_ttl: number;
    webhook_id: string;
    escalation_policy_id: string;
    project_id: string;
    project_dependencies: string[];
    rule: string;
    resource: ResourceModel;
    created_at: TimeStamp;
    updated_at: TimeStamp;
    acknowledged_at: TimeStamp;
    resolved_at: TimeStamp;
    escalated_at: TimeStamp;
    additional_info: any;
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

export interface AlertBottomFilters {
    state: AlertStateFilter;
    urgency: AlertUrgency;
    assigned: AssignedState;
}

export interface AlertListTableFilters extends AlertBottomFilters {
    filters: QueryStoreFilter[];
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
