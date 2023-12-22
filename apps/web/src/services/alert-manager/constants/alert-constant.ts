import { ALERT_STATE, ALERT_URGENCY } from '@/schema/monitoring/alert/constants';

export const ACTION = {
    create: 'create',
    delete: 'delete',
    update: 'update',
    default: 'default',
} as const;

export const EDIT_MODE = {
    DESCRIPTION: 'description',
    PROJECT: 'project',
} as const;

export const ALERT_STATE_FILTER = {
    ...ALERT_STATE,
    OPEN: 'OPEN',
    ALL: 'ALL',
} as const;

export const ALERT_ASSIGNED_FILTER = {
    ALL: 'ALL',
    ASSIGNED_TO_ME: 'ASSIGNED_TO_ME',
} as const;

export const ALERT_URGENCY_FILTER = {
    ...ALERT_URGENCY,
    ALL: 'ALL',
} as const;

export const ALERT_SEVERITY = {
    CRITICAL: 'Critical',
    ERROR: 'Error',
    WARNING: 'Warning',
    INFO: 'Info',
    NOT_AVAILABLE: 'Not Available',
    NONE: 'None',
} as const;
