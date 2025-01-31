import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useQueryKey } from '@/api-clients/_common/composables/use-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PrivateDashboardChangeFolderParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/change-folder';
import type { PrivateDashboardCreateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/create';
import type { PrivateDashboardDeleteParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/delete';
import type { PrivateDashboardGetParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/get';
import type { PrivateDashboardListParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/list';
import type { PrivateDashboardUpdateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/update';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';

export const usePrivateDashboardApi = () => {
    const privateDashboardQueryKey = useQueryKey('private-dashboard/get');
    const privateDashboardListQueryKey = useQueryKey('private-dashboard/list');

    const actions = {
        async create(params: PrivateDashboardCreateParameters) {
            return SpaceConnector.clientV2.dashboard.privateDashboard.list<PrivateDashboardCreateParameters, PrivateDashboardModel>(params);
        },
        async update(params: PrivateDashboardUpdateParameters) {
            return SpaceConnector.clientV2.dashboard.privateDashboard.update<PrivateDashboardUpdateParameters, PrivateDashboardModel>(params);
        },
        async changeFolder(params: PrivateDashboardChangeFolderParameters) {
            return SpaceConnector.clientV2.dashboard.privateDashboard.changeFolder<PrivateDashboardChangeFolderParameters, PrivateDashboardModel>(params);
        },
        async delete(params: PrivateDashboardDeleteParameters) {
            return SpaceConnector.clientV2.dashboard.privateDashboard.unshare<PrivateDashboardDeleteParameters>(params);
        },
        async get(params: PrivateDashboardGetParameters) {
            return SpaceConnector.clientV2.dashboard.privateDashboard.unshare<PrivateDashboardGetParameters, PrivateDashboardModel>(params);
        },
        async list(params: PrivateDashboardListParameters) {
            return SpaceConnector.clientV2.dashboard.privateDashboard.unshare<PrivateDashboardListParameters, ListResponse<PrivateDashboardModel>>(params);
        },
    };

    return {
        privateDashboardQueryKey,
        privateDashboardListQueryKey,
        privateDashboardAPI: actions,
    };
};
