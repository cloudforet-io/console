import { computed } from 'vue';

import { useProviderApi } from '@/api-clients/identity/provider/composables/use-provider-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useProviderList = () => {
    const { providerAPI } = useProviderApi();
    const { key, params } = useServiceQueryKey('identity', 'provider', 'list', {
        params: {
            query: {
                only: ['provider', 'name', 'icon'],
            },
        },
    });

    const { data, isFetching } = useScopedQuery({
        queryKey: key,
        queryFn: () => providerAPI.list(params.value),
        select: (response) => (response.results ?? []).map((provider) => ({
            label: provider.alias || provider.name,
            name: provider.provider,
            image: provider.icon,
        })),
        staleTime: 1000 * 60 * 3,
        gcTime: 1000 * 60 * 30,
    }, ['WORKSPACE', 'DOMAIN']);


    return {
        providerList: computed(() => data.value ?? []),
        loading: isFetching,
    };
};
