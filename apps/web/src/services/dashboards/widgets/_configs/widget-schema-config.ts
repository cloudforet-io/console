import { ASSET_VARIABLE_TYPE_INFO } from '@/lib/reference/asset-reference-config';
import { COST_VARIABLE_TYPE_INFO } from '@/lib/reference/cost-reference-config';
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
    [COST_VARIABLE_TYPE_INFO.cost_data_source.type]: {
        title: COST_VARIABLE_TYPE_INFO.cost_data_source.name,
        type: 'array',
    },
    [COST_VARIABLE_TYPE_INFO.cost_product.type]: {
        title: COST_VARIABLE_TYPE_INFO.cost_product.name,
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost',
            reference_key: COST_VARIABLE_TYPE_INFO.cost_product.key,
        },
    },
    [COST_VARIABLE_TYPE_INFO.cost_usage_type.type]: {
        title: COST_VARIABLE_TYPE_INFO.cost_usage_type.name,
        type: 'array',
        reference: {
            resource_type: 'cost_analysis.Cost',
            reference_key: COST_VARIABLE_TYPE_INFO.cost_usage_type.key,
        },
    },
} as const;

export const ASSET_REFERENCE_SCHEMA = {
    [ASSET_VARIABLE_TYPE_INFO.asset_compliance_type.type]: {
        title: ASSET_VARIABLE_TYPE_INFO.asset_compliance_type.name,
        type: 'array',
        reference: {
            resource_type: 'inventory.CloudServiceType',
            reference_key: ASSET_VARIABLE_TYPE_INFO.asset_compliance_type.key,
        },
    },
    [ASSET_VARIABLE_TYPE_INFO.asset_account.type]: {
        title: ASSET_VARIABLE_TYPE_INFO.asset_account.name,
        type: 'array',
        reference: {
            resource_type: 'inventory.CloudService',
            reference_key: ASSET_VARIABLE_TYPE_INFO.asset_account.key,
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

export const COST_DATA_SOURCE_SCHEMA = {
    title: 'Data Source',
    type: 'string',
    reference: {
        resource_type: 'cost_analysis.DataSource',
        default_path: 0,
    },
};
