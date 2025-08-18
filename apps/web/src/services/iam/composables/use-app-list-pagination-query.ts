import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useAppApi } from '@/api-clients/identity/app/composables/use-app-api';
import type { AppListParameters } from '@/api-clients/identity/app/schema/api-verbs/list';
import type { AppModel } from '@/api-clients/identity/app/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseAppListPaginationQueryOptions {
    params: ComputedRef<AppListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useAppListPaginationQuery = ({ params, thisPage, pageSize }: UseAppListPaginationQueryOptions) => {
    const queryClient = useQueryClient();

    const { appAPI } = useAppApi();

    const { key: appListPaginationQueryKey, params: appListPaginationQueryParams } = useServiceQueryKey('identity', 'app', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const { data, totalCount, isLoading } = useScopedPaginationQuery({
        queryKey: appListPaginationQueryKey,
        queryFn: appAPI.list,
        params: appListPaginationQueryParams,
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 2,
        enabled: true,
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);


    const refresh = async () => {
        await queryClient.resetQueries({ queryKey: appListPaginationQueryKey.value });
    };

    return {
        data: computed<AppModel[]>(() => (data.value?.results || []).map((item) => ({
            ...item,
            tags: item.tags || {},
        }))),
        totalCount: computed(() => totalCount.value || 0),
        isLoading,
        refresh,
    };
};
