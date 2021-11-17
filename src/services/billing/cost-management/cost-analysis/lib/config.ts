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
export type GROUP_BY_ITEM = typeof GROUP_BY_ITEM[keyof typeof GROUP_BY_ITEM];

export const FILTER_ITEM = Object.freeze({
    ...GROUP_BY_ITEM,
    TAG: 'tag',
    ADDITIONAL_FIELD: 'additional_info',
});
export type FILTER_ITEM = typeof FILTER_ITEM[keyof typeof FILTER_ITEM];
export interface FilterItem {
    name: string;
    label: string;
}
export const FILTER_MAP: Record<FILTER_ITEM, FilterItem> = Object.freeze({
    PROJECT: { name: FILTER_ITEM.PROJECT, label: 'Project' },
    SERVICE_ACCOUNT: { name: FILTER_ITEM.SERVICE_ACCOUNT, label: 'Service Account' },
    PRODUCT: { name: FILTER_ITEM.PRODUCT, label: 'Product' },
    REGION: { name: FILTER_ITEM.REGION, label: 'Region' },
    PROVIDER: { name: FILTER_ITEM.PROVIDER, label: 'Provider' },
    TYPE: { name: FILTER_ITEM.TYPE, label: 'Type' },
    RESOURCE: { name: FILTER_ITEM.RESOURCE, label: 'Resource' },
    ACCOUNT: { name: FILTER_ITEM.ACCOUNT, label: 'Account' },
    TAG: { name: FILTER_ITEM.TAG, label: 'Tag' },
    ADDITIONAL_FIELD: { name: FILTER_ITEM.ADDITIONAL_FIELD, label: 'Additional Field' },
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

export interface CostQuerySetOption {
    chart_type: CHART_TYPE;
    group_by: GROUP_BY_ITEM[];
    granularity: GRANULARITY;
    currency: CURRENCY;
    start: string;
    end: string;
    filter: FILTER_ITEM[];
}

export interface CostQuerySetModel {
    cost_query_set_id: string;
    name: string;
    scope: QUERY_VISIBILITY_TYPE;
    options?: CostQuerySetOption;
}
