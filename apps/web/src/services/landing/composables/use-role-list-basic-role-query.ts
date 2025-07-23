import { type ComputedRef } from 'vue';

import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import type { RoleListBasicRoleParameters } from '@/api-clients/identity/role/schema/api-verbs/list-basic-role';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


export const useRoleListBasicRoleQuery = (params?: ComputedRef<RoleListBasicRoleParameters|undefined>) => {
    const { roleAPI } = useRoleApi();

    const { key, params: queryParams } = useServiceQueryKey('identity', 'role', 'list-basic-role', {
        params,
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => roleAPI.listBasicRole(queryParams.value),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minute
        enabled: true,
    }, ['USER']);
};
