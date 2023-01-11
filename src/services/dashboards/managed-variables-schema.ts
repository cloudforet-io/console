import type { DashboardVariablesSchema } from '@/services/dashboards/config';

export const managedDashboardVariablesSchema: DashboardVariablesSchema = {
    properties: {
        project: {
            name: 'Project',
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
        },
        provider: {
            name: 'Provider',
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
        },
        serviceAccount: {
            name: 'Service Account',
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
        },
        user: {
            name: 'User',
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
        },
        cloudServiceType: {
            name: 'Cloud Service Type',
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
        },
        region: {
            name: 'Region',
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
        },
    },
    order: ['project', 'provider', 'serviceAccount', 'user', 'cloudServiceType', 'region'],
};
