import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useCloudServiceApi } from '@/api-clients/inventory/cloud-service/composables/use-cloud-service-api';
import type { CloudServiceAnalyzeParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/analyze';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseCloudServiceAnalyzeQueryOptions {
    params: ComputedRef<CloudServiceAnalyzeParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useCloudServiceAnalyzeQuery = ({ params, enabled }: UseCloudServiceAnalyzeQueryOptions) => {
    const { cloudServiceAPI } = useCloudServiceApi();
    const { key, params: queryParams } = useServiceQueryKey('inventory', 'cloud-service', 'analyze', {
        params: computed(() => params.value),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => cloudServiceAPI.analyze(queryParams.value),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        enabled: computed(() => !!params.value && (enabled?.value ?? true)),
    }, ['DOMAIN', 'WORKSPACE']);
};
