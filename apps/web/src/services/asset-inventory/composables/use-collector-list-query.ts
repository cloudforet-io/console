import { computed, type ComputedRef } from 'vue';

import { useCollectorApi } from '@/api-clients/inventory/collector/composables/use-collector-api';
import type { CollectorListParameters } from '@/api-clients/inventory/collector/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseCollectorListQueryOptions {
    params: ComputedRef<CollectorListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useCollectorListQuery = ({
    params,
    thisPage,
    pageSize,
}: UseCollectorListQueryOptions) => {
    const { collectorAPI } = useCollectorApi();
    const { key, params: collectorParams } = useServiceQueryKey('inventory', 'collector', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });
    const {
        data, isLoading, totalCount, query,
    } = useScopedPaginationQuery({
        queryKey: key,
        queryFn: collectorAPI.list,
        params: collectorParams,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, {
        thisPage: computed(() => thisPage.value),
        pageSize: computed(() => pageSize.value),
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        collectorListData: data,
        isLoading: isLoading || query.isFetching,
        totalCount,
        refetch: query.refetch,
    };
};
