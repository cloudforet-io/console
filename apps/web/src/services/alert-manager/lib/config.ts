import {
    red, coral, yellow, blue, violet, gray,
} from '@/styles/colors';

export enum ACTION {
    create = 'create',
    delete = 'delete',
    update = 'update',
    default = 'default',
}

export const EDIT_MODE = {
    DESCRIPTION: 'description',
    PROJECT: 'project',
} as const;
export type EditMode = typeof EDIT_MODE[keyof typeof EDIT_MODE];

export const ALERT_ACTION = {
    acknowledge: 'acknowledge',
    resolve: 'resolve',
    merge: 'merge',
    delete: 'delete',
} as const;
export type AlertAction = typeof ALERT_ACTION[keyof typeof ALERT_ACTION];

export const SCOPE = {
    DOMAIN: 'DOMAIN',
    PROJECT: 'PROJECT',
} as const;
export type ScopeType = typeof SCOPE[keyof typeof SCOPE];

export enum FINISH_CONDITION {
    acknowledged = 'ACKNOWLEDGED',
    resolved = 'RESOLVED',
}

export const WEBHOOK_STATE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;
export type WebhookState = typeof WEBHOOK_STATE[keyof typeof WEBHOOK_STATE];

export const ALERT_STATE = {
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
    ERROR: 'ERROR',
} as const;
export type AlertState = typeof ALERT_STATE[keyof typeof ALERT_STATE];

export const ALERT_URGENCY = {
    ALL: 'ALL',
    HIGH: 'HIGH',
    LOW: 'LOW',
} as const;
export type AlertUrgency = typeof ALERT_URGENCY[keyof typeof ALERT_URGENCY];

export const ALERT_SEVERITY = {
    CRITICAL: 'Critical',
    ERROR: 'Error',
    WARNING: 'Warning',
    INFO: 'Info',
    NOT_AVAILABLE: 'Not Available',
    NONE: 'None',
} as const;
export type AlertSeverity = typeof ALERT_SEVERITY[keyof typeof ALERT_SEVERITY];

export const ALERT_STATE_FILTER = {
    OPEN: 'OPEN',
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
    ERROR: 'ERROR',
    ALL: 'ALL',
} as const;
export type AlertStateFilter = typeof ALERT_STATE_FILTER[keyof typeof ALERT_STATE_FILTER];

export const ASSIGNED_STATE = {
    ALL: 'ALL',
    ASSIGNED_TO_ME: 'ASSIGNED_TO_ME',
} as const;
export type AssignedState = typeof ASSIGNED_STATE[keyof typeof ASSIGNED_STATE];

export const ALERT_SEVERITY_COLORS: Record<keyof typeof ALERT_SEVERITY, string> = {
    CRITICAL: red[600],
    ERROR: coral[600],
    WARNING: yellow[600],
    INFO: blue[600],
    NOT_AVAILABLE: violet[800],
    NONE: gray[500],
};
