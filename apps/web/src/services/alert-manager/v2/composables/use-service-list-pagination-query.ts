import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useServiceApi } from '@/api-clients/alert-manager/service/composables/use-service-api';
import type { ServiceListParameters } from '@/api-clients/alert-manager/service/schema/api-verbs/list';
import type { ServiceModel } from '@/api-clients/alert-manager/service/schema/model';
import { useScopedPaginationQuery } from '@/query/pagination/use-scoped-pagination-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

interface UseServiceListPaginationQueryOptions {
    params: ComputedRef<ServiceListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useServiceListPaginationQuery = ({ params, thisPage, pageSize }: UseServiceListPaginationQueryOptions) => {
    const queryClient = useQueryClient();

    const { serviceAPI } = useServiceApi();

    const { key: serviceListPaginationQueryKey, params: serviceListPaginationQueryParams } = useServiceQueryKey('alert-manager', 'service', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const query = useScopedPaginationQuery({
        queryKey: serviceListPaginationQueryKey,
        queryFn: serviceAPI.list,
        params: serviceListPaginationQueryParams,
        gcTime: 1000 * 60 * 2,
        enabled: true,
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['WORKSPACE', 'USER', 'DOMAIN']);

    const refresh = async () => {
        await queryClient.invalidateQueries({ queryKey: serviceListPaginationQueryKey.value });
    };

    return {
        data: computed<ServiceModel[]>(() => query.data.value?.results || []),
        totalCount: query.totalCount,
        isLoading: query.isLoading,
        refresh,
    };
};
