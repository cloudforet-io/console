import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import { ASSET_GROUP_BY, COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { ASSET_GROUP_BY_ITEM_MAP, COST_GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';

export const RESOURCE_REFERENCE_SCHEMA = {
    [REFERENCE_TYPE_INFO.provider.type]: {
        title: REFERENCE_TYPE_INFO.provider.name,
        type: 'array',
    },
    [REFERENCE_TYPE_INFO.project.type]: {
        title: REFERENCE_TYPE_INFO.project.name,
        type: 'array',
    },
    [REFERENCE_TYPE_INFO.service_account.type]: {
        title: REFERENCE_TYPE_INFO.service_account.name,
        type: 'array',
    },
    [REFERENCE_TYPE_INFO.project_group.type]: {
        title: REFERENCE_TYPE_INFO.project_group.name,
        type: 'array',
    },
    [REFERENCE_TYPE_INFO.region.type]: {
        title: REFERENCE_TYPE_INFO.region.name,
        type: 'array',
    },
} as const;

export const COST_REFERENCE_SCHEMA = {
    [COST_GROUP_BY.CATEGORY]: {
        title: 'Category',
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost',
            reference_key: COST_GROUP_BY.CATEGORY,
        },
    },
    [COST_GROUP_BY.RESOURCE_GROUP]: {
        title: 'Resource Group',
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost',
            reference_key: COST_GROUP_BY.RESOURCE_GROUP,
        },
    },
    [COST_GROUP_BY.PRODUCT]: {
        title: 'Product',
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost',
            reference_key: COST_GROUP_BY.PRODUCT,
        },
    },
    [COST_GROUP_BY.TYPE]: {
        title: 'Type',
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost',
            reference_key: COST_GROUP_BY.TYPE,
        },
    },
    [COST_GROUP_BY.ACCOUNT]: {
        title: 'Account ID',
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost',
            reference_key: COST_GROUP_BY.ACCOUNT,
        },
    },
} as const;

export const ASSET_REFERENCE_SCHEMA = {
    [ASSET_GROUP_BY.COMPLIANCE_TYPE]: {
        title: 'Compliance Type',
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost', // TODO: should be changed
            reference_key: ASSET_GROUP_BY.COMPLIANCE_TYPE,
        },
    },
    [ASSET_GROUP_BY.ACCOUNT]: {
        title: 'AWS Account ID (Asset)',
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost', // TODO: should be changed
            reference_key: ASSET_GROUP_BY.ACCOUNT, // TODO: should be changed maybe 'asset'?
        },
    },
};

export const COST_GROUP_BY_SCHEMA = {
    title: 'Group by (Cost)',
    type: 'string',
    enum: Object.values(COST_GROUP_BY),
    menuItems: Object.values(COST_GROUP_BY_ITEM_MAP),
};

export const ASSET_GROUP_BY_SCHEMA = {
    title: 'Group by (Asset)',
    type: 'string',
    enum: Object.values(ASSET_GROUP_BY),
    menuItems: Object.values(ASSET_GROUP_BY_ITEM_MAP),
};
