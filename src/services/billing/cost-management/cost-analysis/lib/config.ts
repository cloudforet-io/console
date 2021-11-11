export const GRANULARITY = Object.freeze({
    ACCUMULATED: 'ACCUMULATED',
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
});
export type GRANULARITY = typeof GRANULARITY[keyof typeof GRANULARITY];

export const CHART_TYPE = Object.freeze({
    LINE: 'LINE',
    STACKED_LINE: 'STACKED_LINE',
    COLUMN: 'COLUMN',
    STACKED_COLUMN: 'STACKED_COLUMN',
    DONUT: 'DONUT',
});
export type CHART_TYPE = typeof CHART_TYPE[keyof typeof CHART_TYPE];

export const CURRENCY = Object.freeze({
    USD: 'USD',
    KRW: 'KRW',
    JPY: 'JPY',
});
export type CURRENCY = typeof CURRENCY[keyof typeof CURRENCY];

export const GROUP_BY_ITEM = Object.freeze({
    PROJECT: 'project_id',
    SERVICE_ACCOUNT: 'service_account_id',
    PRODUCT: 'product',
    REGION: 'region_code',
    PROVIDER: 'provider',
    TYPE: 'type',
    RESOURCE: 'resource',
    ACCOUNT: 'account',
});

export const FILTER_ITEM = Object.freeze({
    ...GROUP_BY_ITEM,
    TAG: 'tag',
    ADDITIONAL_FIELD: 'additional_info',
});
export type FILTER_ITEM = typeof FILTER_ITEM[keyof typeof FILTER_ITEM];

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
