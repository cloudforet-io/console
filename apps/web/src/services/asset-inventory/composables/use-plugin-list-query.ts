import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { usePluginApi } from '@/api-clients/repository/plugin/composables/use-plugin-api';
import type { PluginListParameters } from '@/api-clients/repository/plugin/schema/api-verbs/list';
import type { PluginModel } from '@/api-clients/repository/plugin/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UsePluginListQueryOptions {
    params: ComputedRef<PluginListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const usePluginListQuery = ({ params, thisPage, pageSize }: UsePluginListQueryOptions) => {
    const { pluginAPI } = usePluginApi();


    const { key: pluginListQueryKey, params: pluginListQueryParams } = useServiceQueryKey('repository', 'plugin', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const {
        data, isLoading, totalCount, query,
    } = useScopedPaginationQuery({
        queryKey: pluginListQueryKey,
        queryFn: pluginAPI.list,
        params: pluginListQueryParams,
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 2,
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);


    const refresh = async () => {
        query.refetch();
    };

    return {
        data: computed<PluginModel[]>(() => data.value?.results || []),
        totalCount,
        isLoading,
        refresh,
    };
};
