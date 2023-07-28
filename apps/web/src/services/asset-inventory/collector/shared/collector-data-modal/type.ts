export const ATTACHED_ACCOUNT_TYPE = {
    ALL: 'all',
    SPECIFIC: 'specific',
} as const;
export type AttachedAccountType = typeof ATTACHED_ACCOUNT_TYPE[keyof typeof ATTACHED_ACCOUNT_TYPE];

export const COLLECT_DATA_TYPE = {
    COLLECTOR: 'collector',
    SECRET: 'secret',
} as const;

export interface CollectorPlugin {
    name?: string;
    icon?: string;
}
