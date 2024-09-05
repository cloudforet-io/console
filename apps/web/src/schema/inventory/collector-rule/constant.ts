export const COLLECTOR_RULE_TYPE = {
    MANAGED: 'MANAGED',
    CUSTOM: 'CUSTOM',
} as const;

export const COLLECTOR_RULE_CONDITION_POLICY = {
    ALL: 'ALL',
    ANY: 'ANY',
    ALWAYS: 'ALWAYS',
} as const;

export const COLLECTOR_RESOURCE_GROUP = {
    DOMAIN: 'DOMAIN',
    WORKSPACE: 'WORKSPACE',
} as const;
