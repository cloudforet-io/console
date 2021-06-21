/* eslint-disable camelcase */

import { TimeStamp } from '@/models';

export enum ACTION {
    create = 'create',
    delete = 'delete',
    update = 'update',
    default = 'default',
}

export enum ALERT_ACTION {
    acknowledge = 'acknowledge',
    resolve = 'resolve',
    merge = 'merge',
    delete = 'delete',
}

export enum SCOPE {
    global = 'GLOBAL',
    project = 'PROJECT',
}

export enum FINISH_CONDITION {
    acknowledged = 'ACKNOWLEDGED',
    resolved = 'RESOLVED',
}

export const WEBHOOK_STATE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;
export type WEBHOOK_STATE = typeof WEBHOOK_STATE[keyof typeof WEBHOOK_STATE];

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


export const ALERT_STATE = {
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
} as const;
export type ALERT_STATE = typeof ALERT_STATE[keyof typeof ALERT_STATE];

export const ALERT_URGENCY = {
    HIGH: 'HIGH',
    LOW: 'LOW',
} as const;
export type ALERT_URGENCY = typeof ALERT_URGENCY[keyof typeof ALERT_URGENCY];

export const ALERT_SEVERITY = {
    CRITICAL: 'CRITICAL',
    ERROR: 'ERROR',
    WARNING: 'WARNING',
    INFO: 'INFO',
    NOT_AVAILABLE: 'NOT AVAILABLE',
    NONE: 'NONE',
};
export type ALERT_SEVERITY = typeof ALERT_SEVERITY[keyof typeof ALERT_SEVERITY];
