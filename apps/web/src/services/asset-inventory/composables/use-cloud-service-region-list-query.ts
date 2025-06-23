import { useRegionApi } from '@/api-clients/inventory/region/composables/use-region-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useCloudServiceRegionListQuery = () => {
    const { regionAPI } = useRegionApi();
    const { key: regionListKey, params } = useServiceQueryKey('inventory', 'region', 'list', {
        params: {
            query: { only: ['name', 'region_code', 'tags', 'provider'] },
        },
    });
    return useScopedQuery({
        queryKey: regionListKey,
        queryFn: () => regionAPI.list(params.value),
        select: (data) => data?.results || [],
        staleTime: 1000 * 60 * 5, // 5 minutes
    }, ['DOMAIN', 'WORKSPACE']);
};
