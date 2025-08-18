import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useNamespaceApi } from '@/api-clients/inventory/namespace/composables/use-namespace-api';
import type { NamespaceGetParameters } from '@/api-clients/inventory/namespace/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseNamespaceGetQueryOptions {
    namespaceId: ComputedRef<string>;
}

export const useNamespaceGetQuery = ({ namespaceId }: UseNamespaceGetQueryOptions) => {
    const { namespaceAPI } = useNamespaceApi();

    const { key, params: queryParams } = useServiceQueryKey('inventory', 'namespace', 'get', {
        params: computed<NamespaceGetParameters>(() => ({ namespace_id: namespaceId.value })),
        contextKey: namespaceId,
    });

    const namespaceIcon = computed<string>(() => {
        if (!query.data.value) return '';
        return query.data.value.group === 'common' ? 'COMMON' : query.data.value.icon;
    });

    const query = useScopedQuery({
        queryKey: key,
        queryFn: () => namespaceAPI.get(queryParams.value),
        enabled: computed(() => !!namespaceId.value),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data: query.data,
        isLoading: query.isLoading,
        namespaceGetQueryKey: key,
        namespaceIcon,
    };
};
