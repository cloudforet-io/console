import type { PrivateDashboardGetParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/get';
import type { PrivateDashboardListParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/list';



export const privateDashboardKeys = {
    list: (params: PrivateDashboardListParameters) => ['private-dashboard', 'list', params] as const,
    get: (idParam: PrivateDashboardGetParameters['dashboard_id']) => ['private-dashboard', 'get', idParam] as const,
};
