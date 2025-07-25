import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useUserGroupApi } from '@/api-clients/identity/user-group/composables/use-user-group-api';
import type { UserGroupListParameters } from '@/api-clients/identity/user-group/schema/api-verbs/list';
import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseUserGroupListPaginationQueryOptions {
    params: ComputedRef<UserGroupListParameters>;
    thisPage?: ComputedRef<number>;
    pageSize?: ComputedRef<number>;
}

export const useUserGroupListPaginationQuery = ({ params, thisPage, pageSize }: UseUserGroupListPaginationQueryOptions) => {
    const { userGroupAPI } = useUserGroupApi();
    const queryClient = useQueryClient();

    const { key: userGroupListPaginationQueryKey, params: userGroupListPaginationQueryParams } = useServiceQueryKey('identity', 'user-group', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const {
        data,
        totalCount,
        isLoading,
    } = useScopedPaginationQuery({
        queryKey: userGroupListPaginationQueryKey,
        queryFn: userGroupAPI.list,
        params: userGroupListPaginationQueryParams,
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 30,
        enabled: true,
    }, {
        thisPage: thisPage ?? computed(() => 1),
        pageSize: pageSize ?? computed(() => 15),
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);

    const refresh = async () => {
        await queryClient.invalidateQueries({ queryKey: userGroupListPaginationQueryKey.value });
    };

    return {
        data: computed<Partial<UserGroupModel>[]>(() => data.value?.results || []),
        totalCount,
        isLoading,
        refresh,
    };
};
