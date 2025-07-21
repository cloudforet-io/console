import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseWorkspaceGroupRoleListQueryReturn {
    data: Ref<RoleModel[]>;
    totalCount: Ref<number>;
    isLoading: Ref<boolean>;
}

interface UseWorkspaceGroupRoleListQueryOptions {
    params: ComputedRef<RoleListParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useWorkspaceGroupRoleListQuery = ({ params, enabled }: UseWorkspaceGroupRoleListQueryOptions): UseWorkspaceGroupRoleListQueryReturn => {
    const { roleAPI } = useRoleApi();

    const { key: roleListQueryKey, params: roleListQueryParams } = useServiceQueryKey('identity', 'role', 'list', {
        params,
    });

    const { data: queryData, isLoading } = useScopedQuery({
        queryKey: roleListQueryKey,
        queryFn: async () => roleAPI.list(roleListQueryParams.value),
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 5,
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
    }, ['DOMAIN']);

    return {
        data: computed<RoleModel[]>(() => (queryData.value?.results ?? [])),
        totalCount: computed<number>(() => queryData.value?.total_count ?? 0),
        isLoading,
    };
};
