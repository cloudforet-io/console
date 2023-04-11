import { i18n } from '@/translations';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import { GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import type { DashboardVariablesSchema } from '@/services/dashboards/config';

export const COST_VARIABLES_INFO = {
    group_by: {
        key: 'group_by',
        name: 'Group By',
    },
    product: {
        key: 'product',
        name: 'Product',
    },
    account: {
        key: 'account',
        name: 'Account',
    },
} as const;

export const managedDashboardVariablesSchema: DashboardVariablesSchema = {
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
        [COST_VARIABLES_INFO.product.key]: {
            name: COST_VARIABLES_INFO.product.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PRODUCT'),
            options: {
                type: 'SEARCH_RESOURCE',
                resource_key: COST_VARIABLES_INFO.product.key,
            },
        },
        [COST_VARIABLES_INFO.account.key]: {
            name: COST_VARIABLES_INFO.account.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_ACCOUNT'),
            options: {
                type: 'SEARCH_RESOURCE',
                resource_key: COST_VARIABLES_INFO.account.key,
            },
        },
        [COST_VARIABLES_INFO.group_by.key]: {
            name: COST_VARIABLES_INFO.group_by.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_GROUP_BY'),
            options: {
                type: 'ENUM',
                values: Object.values(GROUP_BY_ITEM_MAP).map((d) => ({ key: d.name, label: d.label })),
            },
        },
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
        COST_VARIABLES_INFO.product.key,
        COST_VARIABLES_INFO.account.key,
        COST_VARIABLES_INFO.group_by.key,
        // REFERENCE_TYPE_INFO.user.type,
        // REFERENCE_TYPE_INFO.cloud_service_type.type,
    ],
};
