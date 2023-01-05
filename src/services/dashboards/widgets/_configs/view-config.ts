import { GROUP_BY } from '@/services/dashboards/widgets/_configs/config';

export const GROUP_BY_ITEM_MAP = {
    [GROUP_BY.PROJECT_GROUP]: { name: GROUP_BY.PROJECT_GROUP, label: 'Project Group' },
    [GROUP_BY.PROJECT]: { name: GROUP_BY.PROJECT, label: 'Project' },
    [GROUP_BY.PROVIDER]: { name: GROUP_BY.PROVIDER, label: 'Provider' },
    [GROUP_BY.SERVICE_ACCOUNT]: { name: GROUP_BY.SERVICE_ACCOUNT, label: 'Service Account' },
    [GROUP_BY.CATEGORY]: { name: GROUP_BY.CATEGORY, label: 'Category' },
    [GROUP_BY.RESOURCE_GROUP]: { name: GROUP_BY.RESOURCE_GROUP, label: 'Resource Group' },
    [GROUP_BY.PRODUCT]: { name: GROUP_BY.PRODUCT, label: 'Product' },
    [GROUP_BY.REGION]: { name: GROUP_BY.REGION, label: 'Region' },
    [GROUP_BY.TYPE]: { name: GROUP_BY.TYPE, label: 'Type' },
    [GROUP_BY.ACCOUNT]: { name: GROUP_BY.ACCOUNT, label: 'Account ID' },
} as const;

export const WIDGET_THEMES = ['violet', 'blue', 'coral', 'yellow', 'gray', 'green', 'indigo', 'peacock'] as const;
export type WidgetTheme = typeof WIDGET_THEMES[number];
export type WidgetColorSetType = 'basic'|'massive';
