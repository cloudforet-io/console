import { useProviderApi } from '@/api-clients/identity/provider/composables/use-provider-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useAppContextStore } from '@/store/app-context/app-context-store';

export const useServiceAccountProviderListQuery = () => {
    const appContextStore = useAppContextStore();
    const { providerAPI } = useProviderApi();
    const { key: providerListKey, params: providerListParams } = useServiceQueryKey('identity', 'provider', 'list', {
        params: {
            query: { only: ['provider', 'name', 'icon'] },
        },
    });

    return useScopedQuery({
        queryKey: providerListKey,
        queryFn: () => providerAPI.list(providerListParams.value),
        select: (data) => {
            const providers = data?.results || [];
            if (!appContextStore.getters.isAdminMode) return providers;
            const ADMIN_MODE_PROVIDER_KEYS = ['aws', 'google_cloud', 'azure'];
            return providers.filter((item) => ADMIN_MODE_PROVIDER_KEYS.includes(item.provider));
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 1,
    }, ['DOMAIN', 'WORKSPACE']);
};
