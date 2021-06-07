/* eslint-disable camelcase */

export enum ACTION {
    create = 'create',
    delete = 'delete',
    update = 'update',
    default = 'default',
}

export enum SCOPE {
    global = 'GLOBAL',
    project = 'PROJECT',
}

export enum FINISH_CONDITION {
    acknowledged = 'ACKNOWLEDGED',
    resolved = 'RESOLVED',
}

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
