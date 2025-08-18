import { useProviderApi } from '@/api-clients/identity/provider/composables/use-provider-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useCloudServiceProviderListQuery = () => {
    const { providerAPI } = useProviderApi();
    const { key: providerListKey, params } = useServiceQueryKey('identity', 'provider', 'list', {
        params: {
            query: { only: ['provider', 'name', 'icon', 'alias', 'color', 'options', 'plugin_info'] },
        },
    });
    return useScopedQuery({
        queryKey: providerListKey,
        queryFn: () => providerAPI.list(params.value),
        select: (data) => data?.results || [],
        staleTime: 1000 * 60 * 5, // 5 minutes
    }, ['DOMAIN', 'WORKSPACE']);
};
