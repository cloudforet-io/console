import type { DashboardVariablesSchema } from '@/api-clients/dashboard/_types/dashboard-type';

import {
    MANAGED_VARIABLE_MODEL_KEY_MAP,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';


export const MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP = {
    workspace: { key: 'workspace', modelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.workspace },
    project_group: { key: 'project_group', modelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.project_group },
    project: { key: 'project', modelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.project },
    provider: { key: 'provider', modelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.provider },
    service_account: { key: 'service_account', modelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.service_account },
    region: { key: 'region', modelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.region },
    cost_data_source: { key: 'cost_data_source', modelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.cost_data_source },
    cost_product: { key: 'cost_product', modelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.cost, dataKey: 'product' },
    asset_account: { key: 'asset_account', modelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.cloud_service, dataKey: 'account' },
    cloud_service_query_set: { key: 'cloud_service_query_set', modelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.cloud_service_query_set },
} as const;


export const MANAGED_DASHBOARD_VARIABLES_SCHEMA: DashboardVariablesSchema = {
    properties: {
        [MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.workspace.key]: {
            name: 'Workspace',
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_WORKSPACE',
            options: [{
                type: 'MANAGED',
                key: MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.workspace.modelKey,
            }],
        },
        project_group: {
            name: 'Project Group',
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PROJECT_GROUP',
            options: [{
                type: 'MANAGED',
                key: MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.project_group.modelKey,
            }],
        },
        project: {
            name: 'Project',
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_PROJECT',
            options: [{
                type: 'MANAGED',
                key: MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.project.modelKey,
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
                key: MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.provider.modelKey,
            }],
        },
        service_account: {
            name: 'Service Account',
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_SERVICE_ACCOUNT',
            options: [{
                type: 'MANAGED',
                key: MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.service_account.modelKey,
            }],
        },
        region: {
            name: 'Region',
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_REGION',
            options: [{
                type: 'MANAGED',
                key: MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.region.modelKey,
            }],
        },
        // Variable for Cost Dashboard
        cost_data_source: {
            name: 'Data Source',
            variable_type: 'MANAGED',
            use: false,
            fixed: true, // NOTE: this field is necessary for dashboard before v2.0.0
            selection_type: 'SINGLE',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_DATA_SOURCE',
            required: true,
            options: [{
                type: 'MANAGED',
                key: MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.cost_data_source.modelKey,
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
                key: MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.cost_product.modelKey,
                dataKey: MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.cost_product.dataKey,
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
                key: MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.asset_account.modelKey,
                dataKey: MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.asset_account.dataKey,
            }],
        },
        cloud_service_query_set: {
            name: 'Compliance Framework',
            variable_type: 'MANAGED',
            use: false,
            fixed: true, // NOTE: this field is necessary for dashboard before v2.0.0
            selection_type: 'SINGLE',
            description: 'DASHBOARDS.CUSTOMIZE.VARIABLES.DESCRIPTION_ASSET_COMPLIANCE_FRAMEWORK',
            required: true,
            options: [{
                type: 'MANAGED',
                key: MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.cloud_service_query_set.modelKey,
            }],
        },
    },
    order: [
        MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.cost_data_source.key,
        MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.cloud_service_query_set.key,
        // MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.workspace.key,
        MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.project.key,
        MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.project_group.key,
        MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.provider.key,
        MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.service_account.key,
        MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.region.key,
        MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.cost_product.key,
        MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.asset_account.key,
    ],
};
