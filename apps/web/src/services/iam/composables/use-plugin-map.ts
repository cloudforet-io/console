import { computed } from 'vue';

import { usePluginApi } from '@/api-clients/repository/plugin/composables/use-plugin-api';
import type { PluginModel } from '@/api-clients/repository/plugin/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const usePluginMap = () => {
    const { pluginAPI } = usePluginApi();

    const { key: pluginListQueryKey } = useServiceQueryKey('repository', 'plugin', 'list', {
        params: {
            only: ['plugin_id', 'name', 'tags'],
        },
    });

    const { data: pluginList } = useScopedQuery({
        queryKey: pluginListQueryKey,
        queryFn: () => pluginAPI.list(),
        select: (data) => data.results || [],
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 3,
    }, ['DOMAIN', 'WORKSPACE']);

    const pluginMap = computed(() => pluginList.value?.reduce((acc, curr) => {
        acc[curr.plugin_id] = curr;
        return acc;
    }, {} as Record<string, PluginModel>));

    return {
        pluginMap,
    };
};
