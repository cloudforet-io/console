import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useDataSourceApi } from '@/api-clients/cost-analysis/data-source/composables/use-data-source-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useDataSourceGetQuery = (dataSourceId: ComputedRef<string|undefined>) => {
    const { dataSourceAPI } = useDataSourceApi();
    const { key, params: queryParams } = useServiceQueryKey('cost-analysis', 'data-source', 'get', {
        params: computed(() => ({
            data_source_id: dataSourceId.value,
        })),
    });

    const { data, isLoading } = useScopedQuery({
        queryKey: key,
        queryFn: () => dataSourceAPI.get(queryParams.value),
        enabled: computed(() => !!dataSourceId.value),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        dataSourceData: data,
        isLoading,
    };
};
