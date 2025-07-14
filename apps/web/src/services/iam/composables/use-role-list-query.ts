import type { Ref, ComputedRef } from 'vue';
import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseRoleListQueryReturn {
    roleListData: Ref<RoleModel[]>;
    roleListIsLoading: Ref<boolean>;
    roleListQueryKey: Ref<QueryKey>;
    roleListQueryParams: Ref<RoleListParameters>;
    refetchRoleList: () => Promise<unknown>;
}

export const useRoleListQuery = (
    params?: Ref<RoleListParameters> | ComputedRef<RoleListParameters>,
): UseRoleListQueryReturn => {
    const { roleAPI } = useRoleApi();

    const { key: roleListQueryKey, params: roleListQueryParams } = useServiceQueryKey('identity', 'role', 'list', {
        params: computed(() => ({
            ...(params?.value ?? {}),
        })),
    });

    const { data: roleListData, isLoading, refetch } = useScopedQuery({
        queryKey: roleListQueryKey,
        queryFn: () => roleAPI.list(roleListQueryParams.value),
        select: (data) => data?.results || [],
        initialData: { results: [], total_count: 0 },
        gcTime: 1000 * 60 * 2,
        enabled: true,
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        roleListData: computed<RoleModel[]>(() => roleListData.value ?? []),
        roleListIsLoading: computed(() => isLoading.value),
        roleListQueryKey,
        roleListQueryParams,
        refetchRoleList: refetch,
    };
};
