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

export const SCOPE = {
    DOMAIN: 'DOMAIN',
    PROJECT: 'PROJECT',
} as const;

export enum FINISH_CONDITION {
    acknowledged = 'ACKNOWLEDGED',
    resolved = 'RESOLVED',
}

export const ALERT_STATE_FILTER = {
    OPEN: 'OPEN',
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
    ERROR: 'ERROR',
    ALL: 'ALL',
} as const;

export const ASSIGNED_STATE = {
    ALL: 'ALL',
    ASSIGNED_TO_ME: 'ASSIGNED_TO_ME',
} as const;
