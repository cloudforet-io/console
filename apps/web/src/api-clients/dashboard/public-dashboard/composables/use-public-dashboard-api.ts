import type { ComputedRef } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PublicDashboardChangeFolderParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/change-folder';
import type { PublicDashboardCreateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/create';
import type { PublicDashboardDeleteParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/delete';
import type { PublicDashboardGetParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/get';
import type { PublicDashboardListParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/list';
import type { PublicDashboardShareParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/share';
import type { PublicDashboardUnshareParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/unshare';
import type { PublicDashboardUpdateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/update';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { useReferenceQuerySync } from '@/query/reference/_composables/use-reference-query-sync';

interface UsePublicDashboardApiReturn {
    publicDashboardGetQueryKey: ComputedRef<QueryKey>;
    publicDashboardListQueryKey: ComputedRef<QueryKey>;
    publicDashboardAPI: {
        create: (params: PublicDashboardCreateParameters) => Promise<PublicDashboardModel>;
        update: (params: PublicDashboardUpdateParameters) => Promise<PublicDashboardModel>;
        changeFolder: (params: PublicDashboardChangeFolderParameters) => Promise<PublicDashboardModel>;
        share: (params: PublicDashboardShareParameters) => Promise<PublicDashboardModel>;
        unshare: (params: PublicDashboardUnshareParameters) => Promise<PublicDashboardModel>;
        delete: (params: PublicDashboardDeleteParameters) => Promise<void>;
        get: (params: PublicDashboardGetParameters) => Promise<PublicDashboardModel>;
        list: (params: PublicDashboardListParameters) => Promise<ListResponse<PublicDashboardModel>>;
    }
}

export const usePublicDashboardApi = (): UsePublicDashboardApiReturn => {
    const publicDashboardGetQueryKey = useAPIQueryKey('dashboard', 'public-dashboard', 'get');
    const publicDashboardListQueryKey = useAPIQueryKey('dashboard', 'public-dashboard', 'list');
    const { withReferenceUpdate, withReferenceRefresh } = useReferenceQuerySync<PublicDashboardModel>('publicDashboard');

    const actions = {
        async create(params: PublicDashboardCreateParameters) {
            return withReferenceUpdate(() => SpaceConnector.clientV2.dashboard.publicDashboard.create<PublicDashboardCreateParameters, PublicDashboardModel>(params));
        },
        async update(params: PublicDashboardUpdateParameters) {
            return withReferenceUpdate(() => SpaceConnector.clientV2.dashboard.publicDashboard.update<PublicDashboardUpdateParameters, PublicDashboardModel>(params));
        },
        async changeFolder(params: PublicDashboardChangeFolderParameters) {
            return SpaceConnector.clientV2.dashboard.publicDashboard.changeFolder<PublicDashboardChangeFolderParameters, PublicDashboardModel>(params);
        },
        async share(params: PublicDashboardShareParameters) {
            return SpaceConnector.clientV2.dashboard.publicDashboard.share<PublicDashboardShareParameters, PublicDashboardModel>(params);
        },
        async unshare(params: PublicDashboardUnshareParameters) {
            return SpaceConnector.clientV2.dashboard.publicDashboard.unshare<PublicDashboardUnshareParameters, PublicDashboardModel>(params);
        },
        async delete(params: PublicDashboardDeleteParameters) {
            return withReferenceRefresh(() => SpaceConnector.clientV2.dashboard.publicDashboard.delete<PublicDashboardUnshareParameters>(params));
        },
        async get(params: PublicDashboardGetParameters) {
            return SpaceConnector.clientV2.dashboard.publicDashboard.get<PublicDashboardGetParameters, PublicDashboardModel>(params);
        },
        async list(params: PublicDashboardListParameters) {
            return SpaceConnector.clientV2.dashboard.publicDashboard.list<PublicDashboardListParameters, ListResponse<PublicDashboardModel>>(params);
        },
    };

    return {
        publicDashboardGetQueryKey,
        publicDashboardListQueryKey,
        publicDashboardAPI: actions,
    };
};
