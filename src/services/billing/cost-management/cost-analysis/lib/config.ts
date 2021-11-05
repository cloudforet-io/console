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

export const REQUEST_TYPE = Object.freeze({
    SAVE: 'SAVE',
    EDIT: 'EDIT',
});

export type REQUEST_TYPE = typeof REQUEST_TYPE[keyof typeof REQUEST_TYPE];

export const QUERY_VISIBILITY_TYPE = Object.freeze({
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
});

export type QUERY_VISIBILITY_TYPE = typeof QUERY_VISIBILITY_TYPE[keyof typeof QUERY_VISIBILITY_TYPE];

export interface CostQuerySetModel {
    cost_query_set_id: string;
    name: string;
    scope: QUERY_VISIBILITY_TYPE;
    option?: object;
}
