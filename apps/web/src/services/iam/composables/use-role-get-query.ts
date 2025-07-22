import type { Ref } from 'vue';
import { computed } from 'vue';

import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseRoleGetQueryReturn {
    roleData: Ref<RoleModel | undefined>;
}

export const useRoleGetQuery = (roleId: Ref<string>): UseRoleGetQueryReturn => {
    const { roleAPI } = useRoleApi();

    const { key: roleGetQueryKey, params: roleGetQueryParams } = useServiceQueryKey('identity', 'role', 'get', {
        contextKey: roleId,
        params: computed(() => ({
            role_id: roleId.value,
        })),
    });

    const { data: roleData } = useScopedQuery({
        queryKey: roleGetQueryKey,
        queryFn: () => roleAPI.get(roleGetQueryParams.value),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 30,
        enabled: true,
    }, ['DOMAIN']);

    return {
        roleData,
    };
};
