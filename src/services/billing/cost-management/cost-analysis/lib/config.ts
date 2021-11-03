export const GRANULARITY = Object.freeze({
    ACCUMULATED: 'ACCUMULATED',
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
});

export const CHART_TYPE = Object.freeze({
    LINE: 'LINE',
    STACKED_LINE: 'STACKED_LINE',
    COLUMN: 'COLUMN',
    STACKED_COLUMN: 'STACKED_COLUMN',
    DONUT: 'DONUT',
});

export const CURRENCY = Object.freeze({
    USD: 'USD',
    KRW: 'KRW',
    JPY: 'JPY',
});

export const GROUP_BY_ITEM = Object.freeze({
    PROJECT: 'project',
    SERVICE_ACCOUNT: 'service_account',
    PRODUCT: 'product',
    REGION: 'region',
    PROVIDER: 'provider',
    TYPE: 'type',
    RESOURCE_ID: 'resource_id',
    CURRENCY: 'currency',
    ACCOUNT: 'account',
});
