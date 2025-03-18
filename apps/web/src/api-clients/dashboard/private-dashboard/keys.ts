import type { PrivateDashboardGetParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/get';
import type { PrivateDashboardListParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/list';

export const privateDashboardKeys = {
    all: ['private-dashboard'],
    list: (params: PrivateDashboardListParameters) => [...privateDashboardKeys.all, 'list', params],
    get: (idParam: PrivateDashboardGetParameters['dashboard_id']) => [...privateDashboardKeys.all, 'get', idParam],
};
