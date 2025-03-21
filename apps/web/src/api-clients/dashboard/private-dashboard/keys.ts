import type { PrivateDashboardGetParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/get';
import type { PrivateDashboardListParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/list';

export const privateDashboardKeys = {
    all: ['private-dashboard'] as const,
    list: (params: PrivateDashboardListParameters) => [...privateDashboardKeys.all, 'list', params] as const,
    get: (idParam: PrivateDashboardGetParameters['dashboard_id']) => [...privateDashboardKeys.all, 'get', idParam] as const,
};
