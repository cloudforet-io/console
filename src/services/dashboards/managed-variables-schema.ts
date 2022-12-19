import type { DashboardVariablesSchema } from '@/services/dashboards/config';

export const managedDashboardVariablesSchema: DashboardVariablesSchema = {
    properties: {
        project_id: {
            name: 'Project',
            variable_type: 'MANAGED',
            default_use: true,
            selection_type: 'MULTI',
        },
        provider: {
            name: 'Provider',
            variable_type: 'MANAGED',
            default_use: true,
            selection_type: 'SINGLE',
        },
        service_account_id: {
            name: 'Service Account',
            variable_type: 'MANAGED',
            default_use: true,
            selection_type: 'MULTI',
        },
        user_id: {
            name: 'User',
            variable_type: 'MANAGED',
            selection_type: 'MULTI',
        },
        cloud_service_type_id: {
            name: 'Cloud Service Type',
            variable_type: 'MANAGED',
            selection_type: 'MULTI',
        },
        region_code: {
            name: 'Region',
            variable_type: 'MANAGED',
            selection_type: 'MULTI',
        },
    },
    order: ['project_id', 'provider', 'service_account_id', 'user_id', 'cloud_service_type_id', 'region_code'],
};
