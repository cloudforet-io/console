import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import { GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';

export const RESOURCE_REFERENCE_SCHEMA = {
    [REFERENCE_TYPE_INFO.provider.type]: {
        title: REFERENCE_TYPE_INFO.provider.name,
        type: 'array',
        default: REFERENCE_TYPE_INFO.provider.name,
    },
    [REFERENCE_TYPE_INFO.project.type]: {
        title: REFERENCE_TYPE_INFO.project.name,
        type: 'array',
        default: REFERENCE_TYPE_INFO.project.name,
    },
    [REFERENCE_TYPE_INFO.service_account.type]: {
        title: REFERENCE_TYPE_INFO.service_account.name,
        type: 'array',
        default: REFERENCE_TYPE_INFO.service_account.name,
    },
    [REFERENCE_TYPE_INFO.project_group.type]: {
        title: REFERENCE_TYPE_INFO.project_group.name,
        type: 'array',
        default: REFERENCE_TYPE_INFO.project_group.name,
    },
    [REFERENCE_TYPE_INFO.region.type]: {
        title: REFERENCE_TYPE_INFO.region.name,
        type: 'array',
        default: REFERENCE_TYPE_INFO.region.name,
    },
} as const;

export const COST_REFERENCE_SCHEMA = {
    [GROUP_BY.CATEGORY]: {
        title: 'Category',
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost',
            reference_key: GROUP_BY.CATEGORY,
        },
    },
    [GROUP_BY.RESOURCE_GROUP]: {
        title: 'Resource Group',
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost',
            reference_key: GROUP_BY.RESOURCE_GROUP,
        },
    },
    [GROUP_BY.PRODUCT]: {
        title: 'Product',
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost',
            reference_key: GROUP_BY.PRODUCT,
        },
    },
    [GROUP_BY.TYPE]: {
        title: 'Type',
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost',
            reference_key: GROUP_BY.TYPE,
        },
    },
    [GROUP_BY.ACCOUNT]: {
        title: 'Account ID',
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost',
            reference_key: GROUP_BY.ACCOUNT,
        },
    },
} as const;

export const GROUP_BY_SCHEMA = {
    title: 'Group by',
    type: 'string',
    enum: Object.values(GROUP_BY),
    menuItems: Object.values(GROUP_BY_ITEM_MAP),
};
