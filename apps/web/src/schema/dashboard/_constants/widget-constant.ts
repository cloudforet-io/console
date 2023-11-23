export const WIDGET_OPTION_FILTER_KEY_MAP = {
    // common
    provider: 'filters.provider',
    project: 'filters.project',
    service_account: 'filters.service_account',
    project_group: 'filters.project_group',
    region: 'filters.region',
    // 'filters.cloud_service_type': 'filters.cloud_service_type',
    // 'filters.user': 'filters.user',
    // cost
    cost_product: 'filters.cost_product',
    cost_usage_type: 'filters.cost_usage_type',
    cost_tag_value: 'filters.cost_tag_value',
    cost_additional_info_value: 'filters.cost_additional_info_value',
    // asset
    asset_account: 'filters.asset_account',
} as const;

const WIDGET_FILTER_OPTION_KEYS = Object.values(WIDGET_OPTION_FILTER_KEY_MAP);
export const WIDGET_OPTION_KEYS = [
    // common
    'granularity',
    // cost option keys
    'cost_data_source',
    'cost_data_type',
    'cost_data_field',
    'cost_secondary_data_field',
    // asset option keys
    'cloud_service_query_set',
    'asset_data_field',
    'asset_data_type',
    'asset_secondary_data_field',
    // option filters
    ...WIDGET_FILTER_OPTION_KEYS,
] as const;


export const WIDGET_SIZE = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    full: 'full',
} as const;

export const GRANULARITY = {
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
} as const;

export const COST_DATA_FIELD_MAP = {
    // resource reference type
    PROJECT_GROUP: { name: 'project_group_id', label: 'Project Group' },
    PROJECT: { name: 'project_id', label: 'Project' },
    PROVIDER: { name: 'provider', label: 'Provider' },
    SERVICE_ACCOUNT: { name: 'service_account_id', label: 'Service Account' },
    REGION: { name: 'region_code', label: 'Region' },
    // cost reference
    USAGE_TYPE: { name: 'usage_type', label: 'Type' },
    PRODUCT: { name: 'product', label: 'Product' },
} as const;

export const ASSET_DATA_FIELD_MAP = {
    // resource reference type
    PROJECT: { name: 'project_id', label: 'Project' },
    PROVIDER: { name: 'provider', label: 'Provider' },
    REGION: { name: 'region_code', label: 'Region' },
    // asset reference
    SERVICE: { name: 'additional_info.service', label: 'Service' },
    COMPLIANCE_FRAMEWORK: { name: 'cloud_service_type', label: 'Compliance Framework' },
    ACCOUNT: { name: 'account', label: 'Account' },
};

export const CHART_TYPE = {
    TREEMAP: 'TREEMAP',
    MAP: 'MAP',
    LINE: 'LINE',
    STACKED_COLUMN: 'STACKED_COLUMN',
    DONUT: 'DONUT',
    PIE: 'PIE',
    WAFFLE: 'WAFFLE',
} as const;
