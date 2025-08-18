import { computed, type ComputedRef } from 'vue';

import type { GetPluginMetadataParameters } from '@/api-clients/plugin/plugin/api-verbs/get-plugin-metadata';
import { usePluginApi } from '@/api-clients/repository/plugin/composables/use-plugin-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const usePluginMetadataGetQuery = (params: ComputedRef<GetPluginMetadataParameters>) => {
    const { pluginAPI } = usePluginApi();
    const { key, params: pluginParams } = useServiceQueryKey('plugin', 'plugin', 'get-plugin-metadata', {
        params,
    });

    const query = useScopedQuery({
        queryKey: key,
        queryFn: () => pluginAPI.getPluginMetadata(pluginParams.value),
        enabled: computed(() => !!params.value.plugin_id),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data: query.data,
        isLoading: query.isLoading,
        refetch: query.refetch,
        error: query.error,
        key,
    };
};
