import { computed, type ComputedRef } from 'vue';

import { usePluginApi } from '@/api-clients/repository/plugin/composables/use-plugin-api';
import type { PluginGetParameters } from '@/api-clients/repository/plugin/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UsePluginGetQueryOptions {
    pluginId: ComputedRef<string>;
}

export const usePluginGetQuery = ({
    pluginId,
}: UsePluginGetQueryOptions) => {
    const { pluginAPI } = usePluginApi();
    const { key, params: pluginParams } = useServiceQueryKey('repository', 'plugin', 'get', {
        params: computed<PluginGetParameters>(() => ({
            plugin_id: pluginId.value,
        })),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => pluginAPI.get(pluginParams.value),
        enabled: computed(() => !!pluginId.value),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
    }, ['DOMAIN', 'WORKSPACE']);
};
