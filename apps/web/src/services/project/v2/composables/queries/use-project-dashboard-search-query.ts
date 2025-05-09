import {
    computed, type ComputedRef, watch, ref,
} from 'vue';


import { isEmpty } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';


const DEFAULT_LIST_DATA = { results: [] };
const STALE_TIME = 1000 * 60 * 5;

interface UseProjectDashboardSearchQueryOptions {
    searchFilters: ComputedRef<ConsoleFilter[]>;
}


export const useProjectDashboardSearchQuery = ({ searchFilters }: UseProjectDashboardSearchQueryOptions) => {
    const { publicDashboardAPI } = usePublicDashboardApi();

    const searchApiQueryHelper = new ApiQueryHelper();

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

    /* Querys */
    const publicDashboardIdListQuery = useScopedQuery<ListResponse<PublicDashboardModel>, unknown, string[]>({
        queryKey: publicDashboardListQueryKey,
        queryFn: () => publicDashboardAPI.list(publicDashboardListParams.value),
        select: (data) => data?.results?.map((item) => item.dashboard_id) ?? [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: computed(() => !isEmpty(searchQuery.value)),
    }, ['WORKSPACE']);


    watch(searchFilters, (_searchFilters) => {
        searchApiQueryHelper.setFilters(_searchFilters);
        searchQuery.value = searchApiQueryHelper.data;
    }, { immediate: true });


    return {
        dashboardIdList: computed<Set<string>>(() => {
            const publicDashboardIdList = publicDashboardIdListQuery.data.value ?? [];
            return new Set(publicDashboardIdList);
        }),
        isSearching: computed<boolean>(() => publicDashboardIdListQuery.isFetching.value),
    };
};

