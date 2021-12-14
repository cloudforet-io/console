export const GRANULARITY = Object.freeze({
    ACCUMULATED: 'ACCUMULATED',
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
});
export type GRANULARITY = typeof GRANULARITY[keyof typeof GRANULARITY];

export const GROUP_BY = Object.freeze({
    PROJECT: 'project_id',
    SERVICE_ACCOUNT: 'service_account_id',
    PRODUCT: 'product',
    REGION: 'region_code',
    PROVIDER: 'provider',
    TYPE: 'type',
    ACCOUNT: 'account',
    // RESOURCE: 'resource',
} as const);
export type GROUP_BY = typeof GROUP_BY[keyof typeof GROUP_BY];

export const GROUP_BY_ITEM_MAP = Object.freeze({
    [GROUP_BY.PROJECT]: { name: GROUP_BY.PROJECT, label: 'Project' },
    [GROUP_BY.SERVICE_ACCOUNT]: { name: GROUP_BY.SERVICE_ACCOUNT, label: 'Service Account' },
    [GROUP_BY.PROVIDER]: { name: GROUP_BY.PROVIDER, label: 'Provider' },
    [GROUP_BY.PRODUCT]: { name: GROUP_BY.PRODUCT, label: 'Product' },
    [GROUP_BY.REGION]: { name: GROUP_BY.REGION, label: 'Region' },
    [GROUP_BY.TYPE]: { name: GROUP_BY.TYPE, label: 'Type' },
    [GROUP_BY.ACCOUNT]: { name: GROUP_BY.ACCOUNT, label: 'Account' },
    // [GROUP_BY.RESOURCE]: { name: GROUP_BY.RESOURCE, label: 'Resource' },
});

export const FILTER = Object.freeze({
    ...GROUP_BY,
    // TAG: 'tag',
    // ADDITIONAL_FIELD: 'additional_info',
} as const);
export type FILTER = typeof FILTER[keyof typeof FILTER];

export const FILTER_ITEM_MAP = Object.freeze({
    ...GROUP_BY_ITEM_MAP,
    // TAG: { name: FILTER.TAG, label: 'Tag' },
    // ADDITIONAL_FIELD: { name: FILTER.ADDITIONAL_FIELD, label: 'Additional Field' },
});
