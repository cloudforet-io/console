import { computed, type ComputedRef } from 'vue';

import { usePluginApi } from '@/api-clients/repository/plugin/composables/use-plugin-api';
import type { PluginGetVersionsParameters } from '@/api-clients/repository/plugin/schema/api-verbs/get-versions';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UsePluginGetVersionsQueryOptions {
    pluginId: ComputedRef<string>;
}

export const usePluginGetVersionsQuery = ({
    pluginId,
}: UsePluginGetVersionsQueryOptions) => {
    const { pluginAPI } = usePluginApi();
    const { key, params: pluginParams } = useServiceQueryKey('repository', 'plugin', 'get-versions', {
        params: computed<PluginGetVersionsParameters>(() => ({
            plugin_id: pluginId.value,
        })),
    });

    const query = useScopedQuery({
        queryKey: key,
        queryFn: () => pluginAPI.getVersions(pluginParams.value),
        enabled: computed(() => !!pluginId.value),
        select: (data) => data?.results ?? [],
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
};
