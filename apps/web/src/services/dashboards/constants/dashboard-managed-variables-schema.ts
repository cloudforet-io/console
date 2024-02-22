import type { DashboardVariablesSchema } from '@/schema/dashboard/_types/dashboard-type';

import {
    MANAGED_VARIABLE_MODEL_KEY_MAP,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';


export const MANAGED_DASHBOARD_VARIABLES_SCHEMA: DashboardVariablesSchema = {
    properties: {
        workspace: {
            name: 'Workspace',
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_WORKSPACE',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_KEY_MAP.workspace,
            }],
        },
        project: {
            name: 'Project',
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PROJECT',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_KEY_MAP.project,
            }],
        },
        provider: {
            name: 'Provider',
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PROVIDER',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_KEY_MAP.provider,
            }],
        },
        service_account: {
            name: 'Service Account',
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_SERVICE_ACCOUNT',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_KEY_MAP.service_account,
            }],
        },
        region: {
            name: 'Region',
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_REGION',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_KEY_MAP.region,
            }],
        },
        // Variable for Cost Dashboard
        cost_data_source: {
            name: 'Data Source',
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'SINGLE',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_DATA_SOURCE',
            required: true,
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_data_source,
            }],
        },
        cost_product: {
            name: 'Product (Cost)',
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PRODUCT',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost,
                dataKey: 'product',
            }],
        },
        // Variable for Asset
        asset_account: {
            name: 'AWS Asset Account ID (Asset)',
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_ASSET_ACCOUNT',
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_KEY_MAP.cloud_service,
                dataKey: 'account',
            }],
        },
        cloud_service_query_set: {
            name: 'Compliance Framework',
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'SINGLE',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_ASSET_COMPLIANCE_FRAMEWORK',
            required: true,
            options: [{
                type: 'MANAGED',
                key: MANAGED_VARIABLE_MODEL_KEY_MAP.cloud_service_query_set,
            }],
        },
    },
    order: [
        MANAGED_VARIABLE_MODEL_KEY_MAP.cost_data_source,
        MANAGED_VARIABLE_MODEL_KEY_MAP.cloud_service_query_set,
        MANAGED_VARIABLE_MODEL_KEY_MAP.workspace,
        MANAGED_VARIABLE_MODEL_KEY_MAP.project,
        MANAGED_VARIABLE_MODEL_KEY_MAP.provider,
        MANAGED_VARIABLE_MODEL_KEY_MAP.service_account,
        MANAGED_VARIABLE_MODEL_KEY_MAP.region,
        'cost_product',
        'asset_account',
    ],
};
