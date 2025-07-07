import { computed, type ComputedRef } from 'vue';

import { useNamespaceApi } from '@/api-clients/inventory/namespace/composables/use-namespace-api';
import type { NamespaceListParameters } from '@/api-clients/inventory/namespace/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseNamespaceListQueryOptions {
    params: ComputedRef<NamespaceListParameters>;
}

export const useNamespaceListQuery = ({
    params,
}: UseNamespaceListQueryOptions) => {
    const { namespaceAPI } = useNamespaceApi();
    const { key, params: namespaceParams } = useServiceQueryKey('inventory', 'namespace', 'list', {
        params: computed(() => params.value),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: async () => namespaceAPI.list(namespaceParams.value),
        select: (data) => data?.results ?? [],
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, ['DOMAIN', 'WORKSPACE']);
};
