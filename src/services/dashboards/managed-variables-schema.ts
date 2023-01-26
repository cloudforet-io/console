import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';

export const managedDashboardVariablesSchema: DashboardVariablesSchema = {
    properties: {
        [REFERENCE_TYPE_INFO.project.type]: {
            name: REFERENCE_TYPE_INFO.project.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
        },
        [REFERENCE_TYPE_INFO.provider.type]: {
            name: REFERENCE_TYPE_INFO.provider.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
        },
        [REFERENCE_TYPE_INFO.service_account.type]: {
            name: REFERENCE_TYPE_INFO.service_account.name,
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
        },
        [REFERENCE_TYPE_INFO.user.type]: {
            name: REFERENCE_TYPE_INFO.user.name,
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
        },
        [REFERENCE_TYPE_INFO.cloud_service_type.type]: {
            name: REFERENCE_TYPE_INFO.cloud_service_type.name,
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
        },
        [REFERENCE_TYPE_INFO.region.type]: {
            name: REFERENCE_TYPE_INFO.region.name,
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
        },
    },
    order: [
        REFERENCE_TYPE_INFO.project.type,
        REFERENCE_TYPE_INFO.provider.type,
        REFERENCE_TYPE_INFO.service_account.type,
        REFERENCE_TYPE_INFO.user.type,
        REFERENCE_TYPE_INFO.cloud_service_type.type,
        REFERENCE_TYPE_INFO.region.type,
    ],
};
