import { RouteQueryString } from '@/lib/router-query-string';

export enum ACTION {
    create = 'create',
    delete = 'delete',
    update = 'update',
    default = 'default',
}

export const ALERT_ACTION = {
    acknowledge: 'acknowledge',
    resolve: 'resolve',
    merge: 'merge',
    delete: 'delete',
} as const;
export type ALERT_ACTION = typeof ALERT_ACTION[keyof typeof ALERT_ACTION]

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


export const ALERT_STATE = {
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
} as const;
export type ALERT_STATE = typeof ALERT_STATE[keyof typeof ALERT_STATE];

export const ALERT_URGENCY = Object.freeze({
    ALL: 'ALL',
    HIGH: 'HIGH',
    LOW: 'LOW',
} as const);
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

export const ALERT_STATE_FILTER = Object.freeze({
    OPEN: 'OPEN',
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
    ALL: 'ALL',
} as const);
export type ALERT_STATE_FILTER = typeof ALERT_STATE_FILTER[keyof typeof ALERT_STATE_FILTER];

export const ASSIGNED_STATE = Object.freeze({
    ALL: 'ALL',
    ASSIGNED_TO_ME: 'ASSIGNED_TO_ME',
} as const);
export type ASSIGNED_STATE = typeof ASSIGNED_STATE[keyof typeof ASSIGNED_STATE];
