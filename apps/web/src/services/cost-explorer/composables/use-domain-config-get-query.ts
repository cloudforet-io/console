import { computed } from 'vue';

import { useDomainConfigApi } from '@/api-clients/config/domain-config/composables/use-domain-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useDomainConfigGetQuery = (name: string) => {
    const { domainConfigAPI } = useDomainConfigApi();
    const { key, params: queryParams } = useServiceQueryKey('config', 'domain-config', 'get', {
        params: computed(() => ({
            name,
        })),
    });

    const { data, isLoading } = useScopedQuery({
        queryKey: key,
        queryFn: () => domainConfigAPI.get(queryParams.value),
        enabled: computed(() => !!name),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        domainConfigData: data,
        isLoading,
    };
};
