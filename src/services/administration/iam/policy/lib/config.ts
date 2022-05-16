export const POLICY_TYPES = Object.freeze({
    MANAGED: 'MANAGED',
    CUSTOM: 'CUSTOM',
    ALL: 'ALL',
} as const);
export type PolicyTypes = typeof POLICY_TYPES[keyof typeof POLICY_TYPES];

export const PolicyState = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;
export type PolicyState = typeof PolicyState[keyof typeof PolicyState];
