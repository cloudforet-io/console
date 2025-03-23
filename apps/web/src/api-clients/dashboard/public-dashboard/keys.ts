import type { PublicDashboardGetParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/get';
import type { PublicDashboardListParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/list';

export const publicDashboardKeys = {
    list: (params: PublicDashboardListParameters) => ['public-dashboard', 'list', params] as const,
    get: (idParam: PublicDashboardGetParameters['dashboard_id']) => ['public-dashboard', 'get', idParam] as const,
};
