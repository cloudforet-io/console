import {
    computed, type ComputedRef, reactive, watch, ref,
} from 'vue';


import { isEmpty } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';


const DEFAULT_LIST_DATA = { results: [] };
const STALE_TIME = 1000 * 60 * 5;

interface UseDashboardSearchQueryOptions {
    searchFilters: ComputedRef<ConsoleFilter[]>;
}


export const useDashboardSearchQuery = ({ searchFilters }: UseDashboardSearchQueryOptions) => {
    const { publicDashboardAPI } = usePublicDashboardApi();
    const { privateDashboardAPI } = usePrivateDashboardApi();

    const appContextStore = useAppContextStore();
    const authorizationStore = useAuthorizationStore();
    const searchApiQueryHelper = new ApiQueryHelper();

    const _state = reactive({
        isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
        isWorkspaceOwner: computed<boolean>(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    });
    const searchQuery = ref<Query>({});

    /* Query Keys */
    const { key: publicDashboardListQueryKey, params: publicDashboardListParams } = useServiceQueryKey('dashboard', 'public-dashboard', 'list', {
        params: computed(() => ({
            query: {
                only: ['dashboard_id'],
                ...searchQuery.value,
            },
        })),
    });
    const { key: privateDashboardListQueryKey, params: privateDashboardListParams } = useServiceQueryKey('dashboard', 'private-dashboard', 'list', {
        params: computed(() => ({
            query: {
                only: ['dashboard_id'],
                ...searchQuery.value,
            },
        })),
    });

    /* Querys */
    const publicDashboardIdListQuery = useScopedQuery<ListResponse<PublicDashboardModel>, unknown, string[]>({
        queryKey: publicDashboardListQueryKey,
        queryFn: () => publicDashboardAPI.list(publicDashboardListParams.value),
        select: (data) => data?.results?.map((item) => item.dashboard_id) ?? [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: computed(() => !isEmpty(searchQuery.value) && (_state.isAdminMode || _state.isWorkspaceOwner)),
    }, ['DOMAIN', 'WORKSPACE']);
    const privateDashboardIdListQuery = useScopedQuery<ListResponse<PrivateDashboardModel>, unknown, string[]>({
        queryKey: privateDashboardListQueryKey,
        queryFn: () => privateDashboardAPI.list(privateDashboardListParams.value),
        select: (data) => data?.results?.map((item) => item.dashboard_id) ?? [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: computed(() => !isEmpty(searchQuery.value) && !_state.isAdminMode),
    }, ['WORKSPACE']);

    watch(searchFilters, (_searchFilters) => {
        searchApiQueryHelper.setFilters(_searchFilters);
        searchQuery.value = searchApiQueryHelper.data;
    }, { immediate: true });


    return {
        dashboardIdList: computed<Set<string>>(() => {
            const publicDashboardIdList = publicDashboardIdListQuery.data.value ?? [];
            const privateDashboardIdList = privateDashboardIdListQuery.data.value ?? [];
            if (_state.isAdminMode) {
                return new Set(publicDashboardIdList);
            }
            if (_state.isWorkspaceOwner) {
                return new Set([...publicDashboardIdList, ...privateDashboardIdList]);
            }
            return new Set(privateDashboardIdList);
        }),
        publicDashboardSearching: computed<boolean>(() => publicDashboardIdListQuery.isFetching.value),
        privateDashboardSearching: computed<boolean>(() => privateDashboardIdListQuery.isFetching.value),
    };
};

