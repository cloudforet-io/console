import { ASSET_GROUP_BY, COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';

export const COST_GROUP_BY_ITEM_MAP = {
    [COST_GROUP_BY.PROJECT_GROUP]: { name: COST_GROUP_BY.PROJECT_GROUP, label: 'Project Group' },
    [COST_GROUP_BY.PROJECT]: { name: COST_GROUP_BY.PROJECT, label: 'Project' },
    [COST_GROUP_BY.PROVIDER]: { name: COST_GROUP_BY.PROVIDER, label: 'Provider' },
    [COST_GROUP_BY.SERVICE_ACCOUNT]: { name: COST_GROUP_BY.SERVICE_ACCOUNT, label: 'Service Account' },
    [COST_GROUP_BY.CATEGORY]: { name: COST_GROUP_BY.CATEGORY, label: 'Category' },
    [COST_GROUP_BY.RESOURCE_GROUP]: { name: COST_GROUP_BY.RESOURCE_GROUP, label: 'Resource Group' },
    [COST_GROUP_BY.PRODUCT]: { name: COST_GROUP_BY.PRODUCT, label: 'Product' },
    [COST_GROUP_BY.REGION]: { name: COST_GROUP_BY.REGION, label: 'Region' },
    [COST_GROUP_BY.TYPE]: { name: COST_GROUP_BY.TYPE, label: 'Type' },
    [COST_GROUP_BY.ACCOUNT]: { name: COST_GROUP_BY.ACCOUNT, label: 'Account ID' },
} as const;

export const ASSET_GROUP_BY_ITEM_MAP = {
    [ASSET_GROUP_BY.PROJECT]: { name: ASSET_GROUP_BY.PROJECT, label: 'Project' },
    [ASSET_GROUP_BY.PROVIDER]: { name: ASSET_GROUP_BY.PROVIDER, label: 'Provider' },
    [ASSET_GROUP_BY.REGION]: { name: ASSET_GROUP_BY.REGION, label: 'Region' },
    [ASSET_GROUP_BY.COMPLIANCE_TYPE]: { name: ASSET_GROUP_BY.COMPLIANCE_TYPE, label: 'Compliance Type' },
    [ASSET_GROUP_BY.COMPLIANCE_NUMBER]: { name: ASSET_GROUP_BY.COMPLIANCE_NUMBER, label: 'Compliance Number' },
    [ASSET_GROUP_BY.SERVICE]: { name: ASSET_GROUP_BY.SERVICE, label: 'Service' },
    [ASSET_GROUP_BY.ACCOUNT]: { name: ASSET_GROUP_BY.ACCOUNT, label: 'AWS Account ID' },
};

export const WIDGET_THEMES = ['violet', 'blue', 'coral', 'yellow', 'gray', 'green', 'indigo', 'peacock'] as const;
export type WidgetTheme = typeof WIDGET_THEMES[number];
export type WidgetColorSetType = 'basic'|'massive';
