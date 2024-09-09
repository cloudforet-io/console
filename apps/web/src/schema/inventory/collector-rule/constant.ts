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

export const COLLECTOR_RULE_CONDITION_KEY = {
    provider: 'provider',
    cloud_service_group: 'cloud_service_group',
    cloud_service_type: 'cloud_service_type',
    region_code: 'region_code',
    account: 'account',
    'reference.resource_id': 'reference.resource_id',
    data: 'data',
    tags: 'tags',
} as const;

export const COLLECTOR_RULE_CONDITION_KEY_LABEL = {
    provider: 'Provider',
    cloud_service_group: 'Cloud Service Group',
    cloud_service_type: 'Cloud Service Type',
    region_code: 'Region',
    account: 'Account',
    'reference.resource_id': 'Resource ID',
} as const;

export const COLLECTOR_RULE_CONDITION_OPERATOR = {
    eq: 'eq',
    contain: 'contain',
    not: 'not',
    not_contain: 'not_contain',
} as const;

export const COLLECTOR_RULE_CONDITION_OPERATOR_LABEL = {
    eq: 'Equal',
    contain: 'Contain',
    not: 'Not',
    not_contain: 'Not Contain',
} as const;
