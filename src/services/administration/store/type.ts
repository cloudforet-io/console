/* policy */
export const POLICY_TYPE = {
    MANAGED: 'MANAGED',
    CUSTOM: 'CUSTOM',
    ALL: 'ALL',
} as const;
export type PolicyType = typeof POLICY_TYPE[keyof typeof POLICY_TYPE];
