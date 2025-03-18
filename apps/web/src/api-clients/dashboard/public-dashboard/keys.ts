import type { PublicDashboardGetParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/get';
import type { PublicDashboardListParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/list';

export const publicDashboardKeys = {
    all: ['public-dashboard'],
    list: (params: PublicDashboardListParameters) => [...publicDashboardKeys.all, 'list', params],
    get: (idParam: PublicDashboardGetParameters['dashboard_id']) => [...publicDashboardKeys.all, 'get', idParam],
};
