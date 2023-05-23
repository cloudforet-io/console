import { i18n } from '@/translations';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';

export const COST_VARIABLES_INFO = {
    // cost_group_by: {
    //     key: 'group_by',
    //     name: 'Group By',
    // },
    cost_product: {
        key: 'product',
        name: 'Product (Cost)',
    },
    cost_account: {
        key: 'account',
        // "AWS Account ID" is temporary planning. This will be subdivided into several account ids later.
        name: 'AWS Account ID (Cost)',
    },
} as const;

export const ASSET_VARIABLES_INFO = {
    asset_compliance_type: {
        key: 'compliance_type',
        name: 'Compliance Type',
    },
    asset_account: {
        key: 'account',
        name: 'AWS Account ID (Asset)',
    },
};

export const costManagedDashboardVariablesSchema: DashboardVariablesSchema = {
    properties: {
        [REFERENCE_TYPE_INFO.project.type]: {
            name: REFERENCE_TYPE_INFO.project.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PROJECT'),
            options: {
                type: 'REFERENCE_RESOURCE',
                reference_key: REFERENCE_TYPE_INFO.project.type,
            },
        },
        [REFERENCE_TYPE_INFO.provider.type]: {
            name: REFERENCE_TYPE_INFO.provider.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PROVIDER'),
            options: {
                type: 'REFERENCE_RESOURCE',
                reference_key: REFERENCE_TYPE_INFO.provider.type,
            },
        },
        [REFERENCE_TYPE_INFO.service_account.type]: {
            name: REFERENCE_TYPE_INFO.service_account.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_SERVICE_ACCOUNT'),
            options: {
                type: 'REFERENCE_RESOURCE',
                reference_key: REFERENCE_TYPE_INFO.service_account.type,
            },
        },
        [REFERENCE_TYPE_INFO.region.type]: {
            name: REFERENCE_TYPE_INFO.region.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_REGION'),
            options: {
                type: 'REFERENCE_RESOURCE',
                reference_key: REFERENCE_TYPE_INFO.region.type,
            },
        },
        // Variable for Cost
        [COST_VARIABLES_INFO.cost_product.key]: {
            name: COST_VARIABLES_INFO.cost_product.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PRODUCT'),
            options: {
                type: 'SEARCH_RESOURCE',
                resource_key: COST_VARIABLES_INFO.cost_product.key,
            },
        },
        [COST_VARIABLES_INFO.cost_account.key]: {
            name: COST_VARIABLES_INFO.cost_account.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_ACCOUNT'),
            options: {
                type: 'SEARCH_RESOURCE',
                resource_key: COST_VARIABLES_INFO.cost_account.key,
            },
        },
        // [COST_VARIABLES_INFO.cost_group_by.key]: {
        //     name: COST_VARIABLES_INFO.cost_group_by.name,
        //     variable_type: 'MANAGED',
        //     use: true,
        //     selection_type: 'SINGLE',
        //     description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_GROUP_BY'),
        //     options: {
        //         type: 'ENUM',
        //         values: Object.values(GROUP_BY_ITEM_MAP).map((d) => ({ key: d.name, label: d.label })),
        //     },
        // },
        // Not used
        // [REFERENCE_TYPE_INFO.user.type]: {
        //     name: REFERENCE_TYPE_INFO.user.name,
        //     variable_type: 'MANAGED',
        //     use: false,
        //     selection_type: 'MULTI',
        // },
        // [REFERENCE_TYPE_INFO.cloud_service_type.type]: {
        //     name: REFERENCE_TYPE_INFO.cloud_service_type.name,
        //     variable_type: 'MANAGED',
        //     use: false,
        //     selection_type: 'MULTI',
        // },
    },
    order: [
        REFERENCE_TYPE_INFO.project.type,
        REFERENCE_TYPE_INFO.provider.type,
        REFERENCE_TYPE_INFO.service_account.type,
        REFERENCE_TYPE_INFO.region.type,
        COST_VARIABLES_INFO.cost_product.key,
        COST_VARIABLES_INFO.cost_account.key,
        // COST_VARIABLES_INFO.cost_group_by.key,
        // REFERENCE_TYPE_INFO.user.type,
        // REFERENCE_TYPE_INFO.cloud_service_type.type,
    ],
};

export const assetManagedDashboardVariablesSchema: DashboardVariablesSchema = {
    properties: {
        [REFERENCE_TYPE_INFO.project.type]: {
            name: REFERENCE_TYPE_INFO.project.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PROJECT'),
            options: {
                type: 'REFERENCE_RESOURCE',
                reference_key: REFERENCE_TYPE_INFO.project.type,
            },
        },
        [REFERENCE_TYPE_INFO.provider.type]: {
            name: REFERENCE_TYPE_INFO.provider.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PROVIDER'),
            options: {
                type: 'REFERENCE_RESOURCE',
                reference_key: REFERENCE_TYPE_INFO.provider.type,
            },
        },
        [REFERENCE_TYPE_INFO.service_account.type]: {
            name: REFERENCE_TYPE_INFO.service_account.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_SERVICE_ACCOUNT'),
            options: {
                type: 'REFERENCE_RESOURCE',
                reference_key: REFERENCE_TYPE_INFO.service_account.type,
            },
        },
        // Variable for Asset
        [ASSET_VARIABLES_INFO.asset_compliance_type.key]: {
            name: ASSET_VARIABLES_INFO.asset_compliance_type.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: 'Compliance Type Description', // song-lang
            options: {
                type: 'SEARCH_RESOURCE',
                resource_key: ASSET_VARIABLES_INFO.asset_compliance_type.key,
            },
        },
        [ASSET_VARIABLES_INFO.asset_account.key]: {
            name: ASSET_VARIABLES_INFO.asset_account.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: 'Account Description', // song-lang
            options: {
                type: 'SEARCH_RESOURCE',
                resource_key: ASSET_VARIABLES_INFO.asset_account.key,
            },
        },
    },
    order: [
        REFERENCE_TYPE_INFO.project.type,
        REFERENCE_TYPE_INFO.service_account.type,
        REFERENCE_TYPE_INFO.provider.type,
        ASSET_VARIABLES_INFO.asset_compliance_type.key,
        ASSET_VARIABLES_INFO.asset_account.key,
    ],
};
