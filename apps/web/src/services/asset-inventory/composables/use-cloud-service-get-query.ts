import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useCloudServiceApi } from '@/api-clients/inventory/cloud-service/composables/use-cloud-service-api';
import type { CloudServiceGetParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseCloudServiceGetQueryOptions {
    cloudServiceId: ComputedRef<string>;
    enabled: ComputedRef<boolean>;
}

export const useCloudServiceGetQuery = ({ cloudServiceId, enabled }: UseCloudServiceGetQueryOptions) => {
    const { cloudServiceAPI } = useCloudServiceApi();

    const { key, params: queryParams } = useServiceQueryKey('inventory', 'cloud-service', 'get', {
        params: computed<CloudServiceGetParameters>(() => ({ cloud_service_id: cloudServiceId.value })),
    });

    const query = useScopedQuery({
        queryKey: key,
        queryFn: () => cloudServiceAPI.get(queryParams.value),
        enabled: computed(() => enabled.value && !!cloudServiceId.value),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data: query.data,
        isLoading: query.isLoading,
        cloudServiceGetQueryKey: key,
    };
};
