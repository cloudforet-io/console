import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useCloudServiceApi } from '@/api-clients/inventory/cloud-service/composables/use-cloud-service-api';
import type { CloudServiceListParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseCloudServicePaginationQueryOptions {
    params: ComputedRef<CloudServiceListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
    enabled?: ComputedRef<boolean>;
}

export const useCloudServicePaginationQuery = ({
    params, thisPage, pageSize, enabled,
}: UseCloudServicePaginationQueryOptions) => {
    const { cloudServiceAPI } = useCloudServiceApi();

    const { key, params: queryParams } = useServiceQueryKey('inventory', 'cloud-service', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    return useScopedPaginationQuery({
        queryKey: key,
        queryFn: cloudServiceAPI.list,
        params: queryParams,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        enabled: computed(() => enabled?.value ?? true),
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);
};
