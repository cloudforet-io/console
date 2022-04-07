export const GRANULARITY = Object.freeze({
    ACCUMULATED: 'ACCUMULATED',
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
});
export type GRANULARITY = typeof GRANULARITY[keyof typeof GRANULARITY];

export const GROUP_BY = Object.freeze({
    PROJECT_GROUP: 'project_group_id',
    PROJECT: 'project_id',
    PROVIDER: 'provider',
    SERVICE_ACCOUNT: 'service_account_id',
    CATEGORY: 'category',
    RESOURCE_GROUP: 'resource_group',
    PRODUCT: 'product',
    REGION: 'region_code',
    TYPE: 'usage_type',
    ACCOUNT: 'account',
} as const);
export type GROUP_BY = typeof GROUP_BY[keyof typeof GROUP_BY];

export const GRANULARITY_ITEM_MAP = Object.freeze({
    [GRANULARITY.ACCUMULATED]: { name: GRANULARITY.ACCUMULATED, label: 'Accumulated' },
    [GRANULARITY.DAILY]: { name: GRANULARITY.DAILY, label: 'Daily' },
    [GRANULARITY.MONTHLY]: { name: GRANULARITY.MONTHLY, label: 'Monthly' },
    [GRANULARITY.YEARLY]: { name: GRANULARITY.YEARLY, label: 'Yearly' },
});

export const GROUP_BY_ITEM_MAP = Object.freeze({
    [GROUP_BY.PROJECT_GROUP]: { name: GROUP_BY.PROJECT_GROUP, label: 'Project Group' },
    [GROUP_BY.PROJECT]: { name: GROUP_BY.PROJECT, label: 'Project' },
    [GROUP_BY.PROVIDER]: { name: GROUP_BY.PROVIDER, label: 'Provider' },
    [GROUP_BY.SERVICE_ACCOUNT]: { name: GROUP_BY.SERVICE_ACCOUNT, label: 'Service Account' },
    [GROUP_BY.CATEGORY]: { name: GROUP_BY.CATEGORY, label: 'Category' },
    [GROUP_BY.RESOURCE_GROUP]: { name: GROUP_BY.RESOURCE_GROUP, label: 'Resource Group' },
    [GROUP_BY.PRODUCT]: { name: GROUP_BY.PRODUCT, label: 'Product' },
    [GROUP_BY.REGION]: { name: GROUP_BY.REGION, label: 'Region' },
    // [GROUP_BY.TYPE]: { name: GROUP_BY.TYPE, label: 'Type' },
    [GROUP_BY.ACCOUNT]: { name: GROUP_BY.ACCOUNT, label: 'Account ID' },
});

export const FILTER = Object.freeze({
    ...GROUP_BY,
} as const);
export type FILTER = typeof FILTER[keyof typeof FILTER];

export const FILTER_ITEM_MAP = Object.freeze({
    ...GROUP_BY_ITEM_MAP,
});
