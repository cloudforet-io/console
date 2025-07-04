import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useCloudServiceApi } from '@/api-clients/inventory/cloud-service/composables/use-cloud-service-api';
import type { CloudServiceAnalyzeParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/analyze';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseCloudServiceAnalyzePaginationQueryOptions {
    params: ComputedRef<CloudServiceAnalyzeParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useCloudServiceAnalyzePaginationQuery = ({ params, thisPage, pageSize }: UseCloudServiceAnalyzePaginationQueryOptions) => {
    const { cloudServiceAPI } = useCloudServiceApi();
    const { key, params: queryParams } = useServiceQueryKey('inventory', 'cloud-service', 'analyze', {
        params: computed(() => params.value),
        pagination: true,
    });

    return useScopedPaginationQuery({
        queryKey: key,
        queryFn: cloudServiceAPI.analyze,
        params: queryParams,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        enabled: computed(() => !!params.value),
    }, {
        thisPage,
        pageSize,
        verb: 'analyze',
    }, ['DOMAIN', 'WORKSPACE']);
};
