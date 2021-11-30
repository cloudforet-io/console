export const GRANULARITY = Object.freeze({
    ACCUMULATED: 'ACCUMULATED',
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
});
export type GRANULARITY = typeof GRANULARITY[keyof typeof GRANULARITY];

export const GROUP_BY_ITEM = Object.freeze({
    PROJECT: 'project_id',
    SERVICE_ACCOUNT: 'service_account_id',
    PRODUCT: 'product',
    REGION: 'region_code',
    PROVIDER: 'provider',
    TYPE: 'type',
    RESOURCE: 'resource',
    ACCOUNT: 'account',
} as const);
export type GROUP_BY_ITEM = typeof GROUP_BY_ITEM[keyof typeof GROUP_BY_ITEM];

export const FILTER_ITEM = Object.freeze({
    ...GROUP_BY_ITEM,
    TAG: 'tag',
    ADDITIONAL_FIELD: 'additional_info',
} as const);
export type FILTER_ITEM = typeof FILTER_ITEM[keyof typeof FILTER_ITEM];

export const FILTER_MAP = Object.freeze({
    PROJECT: { name: FILTER_ITEM.PROJECT, label: 'Project' },
    SERVICE_ACCOUNT: { name: FILTER_ITEM.SERVICE_ACCOUNT, label: 'Service Account' },
    PRODUCT: { name: FILTER_ITEM.PRODUCT, label: 'Product' },
    REGION: { name: FILTER_ITEM.REGION, label: 'Region' },
    PROVIDER: { name: FILTER_ITEM.PROVIDER, label: 'Provider' },
    TYPE: { name: FILTER_ITEM.TYPE, label: 'Type' },
    RESOURCE: { name: FILTER_ITEM.RESOURCE, label: 'Resource' },
    ACCOUNT: { name: FILTER_ITEM.ACCOUNT, label: 'Account' },
    // TAG: { name: FILTER_ITEM.TAG, label: 'Tag' },
    // ADDITIONAL_FIELD: { name: FILTER_ITEM.ADDITIONAL_FIELD, label: 'Additional Field' },
});
