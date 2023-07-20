export const ATTACHED_ACCOUNT_TYPE = {
    ALL: 'all',
    SPECIFIC: 'specific',
} as const;

export const COLLECT_DATA_TYPE = {
    COLLECTOR: 'collector',
    SECRET: 'secret',
} as const;

export interface CollectorPlugin {
    name?: string;
    icon?: string;
}
