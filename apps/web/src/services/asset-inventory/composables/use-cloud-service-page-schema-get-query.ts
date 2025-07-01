import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { usePageSchemaApi } from '@/api-clients/add-ons/page-schema/composables/use-page-schema-api';
import type { PageSchemaGetParameters } from '@/api-clients/add-ons/page-schema/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseCloudServicePageSchemaGetQueryOptions {
    params: ComputedRef<PageSchemaGetParameters>;
}

export const useCloudServicePageSchemaGetQuery = (options: UseCloudServicePageSchemaGetQueryOptions) => {
    const { pageSchemaAPI } = usePageSchemaApi();
    const { key, params } = useServiceQueryKey('add-ons', 'page-schema', 'get', {
        params: computed<PageSchemaGetParameters>(() => options.params.value),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => pageSchemaAPI.get(params.value),
        enabled: computed(() => !!params.value),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
    }, ['DOMAIN', 'WORKSPACE']);
};
