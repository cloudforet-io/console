/* eslint-disable camelcase */

import { TimeStamp } from '@/models';
import { QueryStoreFilter } from '@/lib/query/type';
import {
    ALERT_SEVERITY, ALERT_STATE,
    ALERT_STATE_FILTER, ALERT_URGENCY,
    ASSIGNED_STATE,
    FINISH_CONDITION,
    SCOPE,
} from '@/views/monitoring/alert-manager/lib/config';
import { RouteQueryString } from '@/lib/router-query-string';


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

type responder = {
    resource_type: string;
    resource_id: string;
}

interface ResourceModel {
    resource_id?: string;
    resource_type?: string;
    name?: string;
    ip_address?: string;
}

export interface AlertDataModel {
    responders: responder[];
    alert_number: number;
    alert_id: string;
    title: string;
    state: ALERT_STATE;
    status_message: string;
    description: string;
    assignee: string;
    urgency: ALERT_URGENCY;
    severity: ALERT_SEVERITY;
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
}

export interface AlertBottomFilters {
    state: ALERT_STATE_FILTER;
    urgency: ALERT_URGENCY;
    assigned: ASSIGNED_STATE;
}

export interface AlertListTableFilters extends AlertBottomFilters {
    filters: QueryStoreFilter[];
}

export type AlertListPageUrlQuery = Partial<Record<'state' | 'urgency' | 'assigned' | 'filters', RouteQueryString>>
