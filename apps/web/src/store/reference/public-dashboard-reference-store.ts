import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PublicDashboardListParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/list';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type {
    ReferenceItem, ReferenceLoadOptions, ReferenceMap,
} from '@/store/reference/type';

interface PublicDashboardResourceItemData {
    resourceGroup?: PublicDashboardModel['resource_group'];
    projectId?: string;
    folderId?: string;
    shared?: boolean;
    scope?: string;
}
export type PublicDashboardReferenceItem = Required<Pick<ReferenceItem<PublicDashboardResourceItemData>, 'key'|'label'|'name'|'data'>>;
export type PublicDashboardReferenceMap = ReferenceMap<PublicDashboardReferenceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const usePublicDashboardReferenceStore = defineStore('reference-dashboard', () => {
    const authorizationStore = useAuthorizationStore();
    const state = reactive({
        items: null as PublicDashboardReferenceMap | null,
    });

    const getters = reactive({
        publicDashboardItems: asyncComputed<PublicDashboardReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        publicDashboardTypeInfo: computed(() => ({
            type: 'public_dashboard',
            key: 'dashboard_id',
            name: 'Public Dashboard',
            referenceMap: getters.publicDashboardItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const params: PublicDashboardListParameters = {
            query: {
                only: ['dashboard_id', 'name', 'project_id', 'resource_group', 'shared', 'scope', 'folder_id'],
            },
        };
        const res = await SpaceConnector.clientV2.dashboard.publicDashboard.list<PublicDashboardListParameters, ListResponse<PublicDashboardModel>>(params);

        const dashboardReferenceMap: PublicDashboardReferenceMap = {};

        // eslint-disable-next-line no-restricted-syntax
        res?.results?.forEach((dashboardInfo) => {
            dashboardReferenceMap[dashboardInfo.dashboard_id] = {
                key: dashboardInfo.dashboard_id,
                label: dashboardInfo.name,
                name: dashboardInfo.name,
                data: {
                    resourceGroup: dashboardInfo?.resource_group,
                    projectId: dashboardInfo?.project_id,
                    folderId: dashboardInfo?.folder_id,
                    shared: dashboardInfo?.shared,
                    scope: dashboardInfo?.scope,
                },
            };
        });

        state.items = dashboardReferenceMap;
        lastLoadedTime = currentTime;
    };

    const sync = async (dashboard: PublicDashboardModel) => {
        state.items = {
            ...state.items,
            [dashboard.dashboard_id]: {
                key: dashboard.dashboard_id,
                label: dashboard.name,
                name: dashboard.name,
                data: {
                    resourceGroup: dashboard?.resource_group,
                    projectId: dashboard?.project_id,
                    folderId: dashboard?.folder_id,
                    shared: dashboard?.shared,
                    scope: dashboard?.scope,
                },
            },
        };
    };

    const flush = () => {
        state.items = null;
        lastLoadedTime = 0;
    };

    const actions = {
        load,
        sync,
        flush,
    };

    return {
        state,
        getters,
        ...actions,
    };
});

