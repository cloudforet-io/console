export const EVENT_RULE_CONDITIONS_POLICY = {
    ALL: 'ALL',
    ANY: 'ANY',
    ALWAYS: 'ALWAYS',
} as const;

export const EVENT_RULE_URGENCY = {
    HIGH: 'HIGH',
    LOW: 'LOW',
} as const;

export const EVENT_RULE_SCOPE = {
    GLOBAL: 'GLOBAL',
    WEBHOOK: 'WEBHOOK',
};
