
import { useQueryClient } from '@tanstack/vue-query';

import { useNamespaceApi } from '@/api-clients/inventory/namespace/composables/use-namespace-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

export const useNamespaceQueryFetcher = () => {
    const { namespaceAPI } = useNamespaceApi();
    const queryClient = useQueryClient();
    const { withSuffix: namespaceQueryKey } = useServiceQueryKey('inventory', 'namespace', 'get');

    const getNamespace = async (namespaceId: string) => queryClient.fetchQuery({
        queryKey: namespaceQueryKey([namespaceId, { namespace_id: namespaceId }]),
        queryFn: () => namespaceAPI.get({ namespace_id: namespaceId }),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 3,
    });

    return {
        getNamespace,
    };
};
