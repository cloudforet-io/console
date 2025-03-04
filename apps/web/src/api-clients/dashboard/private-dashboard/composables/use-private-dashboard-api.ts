import type { ComputedRef } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PrivateDashboardChangeFolderParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/change-folder';
import type { PrivateDashboardCreateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/create';
import type { PrivateDashboardDeleteParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/delete';
import type { PrivateDashboardGetParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/get';
import type { PrivateDashboardListParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/list';
import type { PrivateDashboardUpdateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/update';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';

interface UsePrivateDashboardApiReturn {
    privateDashboardGetQueryKey: ComputedRef<QueryKey>;
    privateDashboardListQueryKey: ComputedRef<QueryKey>;
    privateDashboardAPI: {
        create: (params: PrivateDashboardCreateParameters) => Promise<PrivateDashboardModel>;
        update: (params: PrivateDashboardUpdateParameters) => Promise<PrivateDashboardModel>;
        changeFolder: (params: PrivateDashboardChangeFolderParameters) => Promise<PrivateDashboardModel>;
        delete: (params: PrivateDashboardDeleteParameters) => Promise<void>;
        get: (params: PrivateDashboardGetParameters) => Promise<PrivateDashboardModel>;
        list: (params: PrivateDashboardListParameters) => Promise<ListResponse<PrivateDashboardModel>>;
    }
}


export const usePrivateDashboardApi = (): UsePrivateDashboardApiReturn => {
    const privateDashboardGetQueryKey = useAPIQueryKey('dashboard', 'private-dashboard', 'get');
    const privateDashboardListQueryKey = useAPIQueryKey('dashboard', 'private-dashboard', 'list');

    const actions = {
        async create(params: PrivateDashboardCreateParameters) {
            return SpaceConnector.clientV2.dashboard.privateDashboard.create<PrivateDashboardCreateParameters, PrivateDashboardModel>(params);
        },
        async update(params: PrivateDashboardUpdateParameters) {
            return SpaceConnector.clientV2.dashboard.privateDashboard.update<PrivateDashboardUpdateParameters, PrivateDashboardModel>(params);
        },
        async changeFolder(params: PrivateDashboardChangeFolderParameters) {
            return SpaceConnector.clientV2.dashboard.privateDashboard.changeFolder<PrivateDashboardChangeFolderParameters, PrivateDashboardModel>(params);
        },
        async delete(params: PrivateDashboardDeleteParameters) {
            return SpaceConnector.clientV2.dashboard.privateDashboard.delete<PrivateDashboardDeleteParameters>(params);
        },
        async get(params: PrivateDashboardGetParameters) {
            return SpaceConnector.clientV2.dashboard.privateDashboard.get<PrivateDashboardGetParameters, PrivateDashboardModel>(params);
        },
        async list(params: PrivateDashboardListParameters) {
            return SpaceConnector.clientV2.dashboard.privateDashboard.list<PrivateDashboardListParameters, ListResponse<PrivateDashboardModel>>(params);
        },
    };

    return {
        privateDashboardGetQueryKey,
        privateDashboardListQueryKey,
        privateDashboardAPI: actions,
    };
};
