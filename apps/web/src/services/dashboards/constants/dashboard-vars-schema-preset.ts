import type { DashboardGlobalVariablesSchema } from '@/api-clients/dashboard/_types/dashboard-type';



export const DASHBOARD_VARS_SCHEMA_PRESET: DashboardGlobalVariablesSchema = {
    properties: {
        project_group_id: {
            key: 'project_group_id',
            name: 'Project Group',
            method: 'dynamic',
            type: 'reference',
            use: true,
            reference: {
                resourceType: 'identity.ProjectGroup',
            },
            options: {
                selectionType: 'multi',
            },
        },
        project_id: {
            key: 'project_id',
            name: 'Project',
            method: 'dynamic',
            type: 'reference',
            use: true,
            reference: {
                resourceType: 'identity.Project',
            },
            options: {
                selectionType: 'multi',
            },
        },
        service_account_id: {
            key: 'service_account_id',
            name: 'Service Account',
            method: 'dynamic',
            type: 'reference',
            use: true,
            reference: {
                resourceType: 'identity.ServiceAccount',
            },
            options: {
                selectionType: 'multi',
            },
        },
        region_code: {
            key: 'region_code',
            name: 'Region',
            method: 'dynamic',
            type: 'reference',
            use: true,
            reference: {
                resourceType: 'inventory.Region',
            },
            options: {
                selectionType: 'multi',
            },
        },
    },
} as const;
