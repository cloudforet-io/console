import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useRoleBindingApi } from '@/api-clients/identity/role-binding/composables/use-role-binding-api';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

const DEFAULT_LIST_DATA = { results: [] };
const STALE_TIME = 1000 * 60 * 5;

export const useRoleBindingQuery = () => {
    const { roleBindingAPI } = useRoleBindingApi();

    const { key: roleBindingListQueryKey, params: roleBindingListQueryParams } = useServiceQueryKey('identity', 'role-binding', 'list');

    const roleBindingListQuery = useScopedQuery({
        queryKey: roleBindingListQueryKey,
        queryFn: () => roleBindingAPI.list(roleBindingListQueryParams.value),
        select: (data) => data?.results ?? [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: true,
    }, ['DOMAIN', 'WORKSPACE']);

    const isFetching = computed<boolean>(() => roleBindingListQuery.isFetching.value);

    const queryClient = useQueryClient();

    const invalidateRoleBindingListQuery = () => {
        queryClient.invalidateQueries({ queryKey: roleBindingListQueryKey.value });
    };

    return {
        roleBindingList: computed<RoleBindingModel[]|any>(() => (roleBindingListQuery.data.value ?? [])),
        isFetching,
        roleBindingListQueryKey,
        roleBindingAPI,
        invalidateRoleBindingListQuery,
        queryClient,
    };
};
