import type { Ref } from 'vue';
import { computed } from 'vue';

import { useRoleBindingApi } from '@/api-clients/identity/role-binding/composables/use-role-binding-api';
import type { RoleBindingListParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/list';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useRoleBindingListQuery = (params?: Ref<RoleBindingListParameters>) => {
    const { roleBindingAPI } = useRoleBindingApi();

    const { key: roleBindingListKey, params: roleBindingListQueryParams } = useServiceQueryKey('identity', 'role-binding', 'list', {
        params: computed(() => params?.value ?? {}),
    });

    const { data: roleBindingListData, isLoading, refetch } = useScopedQuery({
        queryKey: roleBindingListKey,
        queryFn: () => roleBindingAPI.list(roleBindingListQueryParams.value),
        select: (data) => data?.results || [],
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 30,
        enabled: true,
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        roleBindingListData: computed<RoleBindingModel[]>(() => roleBindingListData.value ?? []),
        roleBindingListIsLoading: isLoading,
        roleBindingListQueryKey: roleBindingListKey,
        roleBindingListQueryParams,
        refetchRoleBindingList: refetch,
    };
};
