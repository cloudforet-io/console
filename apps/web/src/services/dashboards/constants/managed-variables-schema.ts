import type { DashboardVariablesSchema } from '@/schema/dashboard/_types/dashboard-type';

import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';


export const MANAGED_DASH_VAR_SCHEMA: DashboardVariablesSchema = {
    properties: {
        [MANAGED_VARIABLE_MODEL_CONFIGS.workspace.key]: {
            name: MANAGED_VARIABLE_MODEL_CONFIGS.workspace.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_WORKSPACE',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_CONFIGS.workspace.key,
            }],
        },
        [MANAGED_VARIABLE_MODEL_CONFIGS.project.key]: {
            name: MANAGED_VARIABLE_MODEL_CONFIGS.project.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PROJECT',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_CONFIGS.project.key,
            }],
        },
        [MANAGED_VARIABLE_MODEL_CONFIGS.provider.key]: {
            name: MANAGED_VARIABLE_MODEL_CONFIGS.provider.name,
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PROVIDER',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_CONFIGS.provider.key,
            }],
        },
        [MANAGED_VARIABLE_MODEL_CONFIGS.service_account.key]: {
            name: MANAGED_VARIABLE_MODEL_CONFIGS.service_account.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_SERVICE_ACCOUNT',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_CONFIGS.service_account.key,
            }],
        },
        [MANAGED_VARIABLE_MODEL_CONFIGS.region.key]: {
            name: MANAGED_VARIABLE_MODEL_CONFIGS.region.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_REGION',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_CONFIGS.region.key,
            }],
        },
        // Variable for Cost Dashboard
        [MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.key]: {
            name: MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.name,
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'SINGLE',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_DATA_SOURCE',
            required: true,
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.key,
            }],
        },
        [MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.key]: {
            name: MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.name,
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PRODUCT',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.key,
            }],
        },
        // Variable for Asset
        [MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.key]: {
            name: MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.name,
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_ASSET_ACCOUNT',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.key,
            }],
        },
        [MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key]: {
            name: MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.name,
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'SINGLE',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_ASSET_COMPLIANCE_FRAMEWORK',
            required: true,
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key,
            }],
        },
    },
    order: [
        MANAGED_VARIABLE_MODEL_CONFIGS.cost_data_source.key,
        MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key,
        MANAGED_VARIABLE_MODEL_CONFIGS.workspace.key,
        MANAGED_VARIABLE_MODEL_CONFIGS.project.key,
        MANAGED_VARIABLE_MODEL_CONFIGS.provider.key,
        MANAGED_VARIABLE_MODEL_CONFIGS.service_account.key,
        MANAGED_VARIABLE_MODEL_CONFIGS.region.key,
        MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.key,
        MANAGED_VARIABLE_MODEL_CONFIGS.asset_account.key,
    ],
};
