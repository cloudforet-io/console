import { i18n } from '@/translations';

import { ASSET_REFERENCE_TYPE_INFO } from '@/lib/reference/asset-reference-config';
import { COST_REFERENCE_TYPE_INFO } from '@/lib/reference/cost-reference-config';
import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';


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
        [COST_REFERENCE_TYPE_INFO.cost_product.type]: {
            name: COST_REFERENCE_TYPE_INFO.cost_product.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PRODUCT'),
            options: {
                type: 'SEARCH_RESOURCE',
                resource_key: COST_REFERENCE_TYPE_INFO.cost_product.key,
            },
        },
        [COST_REFERENCE_TYPE_INFO.cost_account.type]: {
            name: COST_REFERENCE_TYPE_INFO.cost_account.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_ACCOUNT'),
            options: {
                type: 'SEARCH_RESOURCE',
                resource_key: COST_REFERENCE_TYPE_INFO.cost_account.key,
            },
        },
        // [COST_VARIABLES_INFO.group_by.key]: {
        //     name: COST_VARIABLES_INFO.group_by.name,
        //     variable_type: 'MANAGED',
        //     use: true,
        //     selection_type: 'SINGLE',
        //     description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_GROUP_BY'),
        //     options: {
        //         type: 'ENUM',
        //         values: Object.values(GROUP_BY_ITEM_MAP).map((d) => ({ key: d.name, label: d.label })),
        //     },
        // },
    },
    order: [
        REFERENCE_TYPE_INFO.project.type,
        REFERENCE_TYPE_INFO.provider.type,
        REFERENCE_TYPE_INFO.service_account.type,
        REFERENCE_TYPE_INFO.region.type,
        COST_REFERENCE_TYPE_INFO.cost_product.type,
        COST_REFERENCE_TYPE_INFO.cost_account.type,
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
        // Variable for Asset
        [ASSET_REFERENCE_TYPE_INFO.asset_compliance_type.type]: {
            name: ASSET_REFERENCE_TYPE_INFO.asset_compliance_type.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: 'Compliance Type Description', // song-lang
            options: {
                type: 'SEARCH_RESOURCE',
                resource_key: ASSET_REFERENCE_TYPE_INFO.asset_compliance_type.key,
            },
        },
        [ASSET_REFERENCE_TYPE_INFO.asset_account.type]: {
            name: ASSET_REFERENCE_TYPE_INFO.asset_account.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: 'Account Description', // song-lang
            options: {
                type: 'SEARCH_RESOURCE',
                resource_key: ASSET_REFERENCE_TYPE_INFO.asset_account.key,
            },
        },
    },
    order: [
        REFERENCE_TYPE_INFO.project.type,
        REFERENCE_TYPE_INFO.service_account.type,
        REFERENCE_TYPE_INFO.provider.type,
        REFERENCE_TYPE_INFO.region.type,
        ASSET_REFERENCE_TYPE_INFO.asset_compliance_type.type,
        ASSET_REFERENCE_TYPE_INFO.asset_account.type,
    ],
};
