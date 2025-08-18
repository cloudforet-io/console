import { computed, type ComputedRef } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

import { useRolePageStore } from '@/services/iam/store/role-page-store';

interface UseRoleListPaginationQueryOptions {
    params: ComputedRef<RoleListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useRoleListPaginationQuery = ({ params, thisPage, pageSize }: UseRoleListPaginationQueryOptions) => {
    const { roleAPI } = useRoleApi();
    const queryClient = useQueryClient();

    const rolePageStore = useRolePageStore();

    const { key: roleListPaginationQueryKey, params: roleListPaginationQueryParams } = useServiceQueryKey('identity', 'role', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const {
        data,
        totalCount,
        isLoading,
    } = useScopedPaginationQuery({
        queryKey: roleListPaginationQueryKey,
        queryFn: roleAPI.list,
        params: roleListPaginationQueryParams,
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 30,
        enabled: true,
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['DOMAIN']);

    const refresh = async () => {
        await queryClient.invalidateQueries({ queryKey: roleListPaginationQueryKey.value });
        rolePageStore.setSelectedIndices([]);
    };

    return {
        data: computed<Partial<RoleModel>[]>(() => data.value?.results || []),
        totalCount,
        isLoading,
        refresh,
    };
};
