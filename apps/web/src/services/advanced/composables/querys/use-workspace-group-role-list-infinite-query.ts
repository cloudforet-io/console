import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedInfiniteQuery } from '@/query/service-query/use-scoped-infinite-query';


interface UseWorkspaceGroupRoleListInfiniteQueryOptions {
    searchText: ComputedRef<string>;
}

export const useWorkspaceGroupRoleListInfiniteQuery = ({ searchText }: UseWorkspaceGroupRoleListInfiniteQueryOptions) => {
    const { roleAPI } = useRoleApi();

    const roleListApiQueryHelper = new ApiQueryHelper().setFilters([
        { k: 'state', v: ROLE_STATE.ENABLED, o: '=' },
        { k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: '!=' },
    ]);

    const { key: workspaceGroupRoleListQueryKey, params: workspaceGroupRoleListQueryParams } = useServiceQueryKey('identity', 'role', 'list', {
        params: computed(() => ({
            query: {
                ...roleListApiQueryHelper.setFilters([
                    { k: 'name', v: searchText.value, o: '' },
                ]).data,
            },
        })),
    });

    return useScopedInfiniteQuery({
        queryKey: workspaceGroupRoleListQueryKey,
        queryFn: ({ pageParam }) => roleAPI.list({
            ...workspaceGroupRoleListQueryParams.value,
            query: {
                ...workspaceGroupRoleListQueryParams.value.query,
                page: { start: pageParam, limit: 10 },
            },
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const loadedCount = allPages.reduce((acc, page) => acc + (page?.results?.length || 0), 0);
            return loadedCount < (lastPage?.total_count || 0) ? loadedCount + 1 : undefined;
        },
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 5,
        enabled: true,
    }, ['DOMAIN']);

    // const refresh = async () => {
    //     query.refetch();
    // };
};
