import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useCloudServiceApi } from '@/api-clients/inventory/cloud-service/composables/use-cloud-service-api';
import type { CloudServiceListParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


export const useCloudServiceListQuery = (
    params?: ComputedRef<CloudServiceListParameters>,
    enabled?: ComputedRef<boolean>,
) => {
    const { cloudServiceAPI } = useCloudServiceApi();

    const { key, params: queryParams } = useServiceQueryKey('inventory', 'cloud-service', 'list', {
        params: computed(() => ({
            ...(params?.value ?? {}),
        })),
    });

    const {
        data, isLoading, error, isSuccess, refetch,
    } = useScopedQuery({
        queryKey: key,
        queryFn: () => cloudServiceAPI.list(queryParams.value),
        select: (res) => res?.results || [],
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
        enabled: computed(() => enabled?.value ?? true),
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data,
        isLoading,
        isSuccess,
        key,
        error,
        refetch,
    };
};
