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
        queryKey: key,
        queryFn: cloudServiceAPI.getData,
        params: queryParams,
        enabled: computed(() => enabled.value),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
    }, {
        thisPage,
        pageSize,
        verb: 'get-data',
    }, ['DOMAIN', 'WORKSPACE']);
};
