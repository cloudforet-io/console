import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useCloudServiceApi } from '@/api-clients/inventory/cloud-service/composables/use-cloud-service-api';
import type { CloudServiceGetDataParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/get-data';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';



interface UseCloudServiceGetDataQueryOptions {
    params: ComputedRef<CloudServiceGetDataParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
    enabled: ComputedRef<boolean>;
}

export const useCloudServiceGetDataPaginationQuery = ({
    params, thisPage, pageSize, enabled,
}: UseCloudServiceGetDataQueryOptions) => {
    const { cloudServiceAPI } = useCloudServiceApi();

    const { key, params: queryParams } = useServiceQueryKey('inventory', 'cloud-service', 'get-data', {
        params: computed<CloudServiceGetDataParameters>(() => params.value),
        pagination: true,
    });

    return useScopedPaginationQuery({
        enabled: computed(() => {
            const _enabled = enabled.value;
            return _enabled;
        }),
        queryKey: key,
        queryFn: cloudServiceAPI.getData,
        params: queryParams,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        retry: 100,
    }, {
        thisPage,
        pageSize,
        verb: 'get-data',
    }, ['DOMAIN', 'WORKSPACE']);
};
