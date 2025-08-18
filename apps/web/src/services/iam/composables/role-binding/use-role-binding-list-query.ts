import { computed, type ComputedRef } from 'vue';

import { useRoleBindingApi } from '@/api-clients/identity/role-binding/composables/use-role-binding-api';
import type { RoleBindingListParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseRoleBindingListQueryOptions {
    params: ComputedRef<RoleBindingListParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useRoleBindingListQuery = ({
    params,
    enabled,
}: UseRoleBindingListQueryOptions) => {
    const { roleBindingAPI } = useRoleBindingApi();
    const { key, params: queryParams } = useServiceQueryKey('identity', 'role-binding', 'list', {
        params,
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => roleBindingAPI.list(queryParams.value),
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
    }, ['DOMAIN', 'WORKSPACE']);
};
