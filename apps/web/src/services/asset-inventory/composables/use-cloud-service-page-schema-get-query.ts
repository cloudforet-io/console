import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { usePageSchemaApi } from '@/api-clients/add-ons/page-schema/composables/use-page-schema-api';
import type { PageSchemaGetParameters } from '@/api-clients/add-ons/page-schema/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseCloudServicePageSchemaGetQueryOptions {
    params: ComputedRef<PageSchemaGetParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useCloudServicePageSchemaGetQuery = ({ params, enabled }: UseCloudServicePageSchemaGetQueryOptions) => {
    const { pageSchemaAPI } = usePageSchemaApi();
    const { key, params: queryParams } = useServiceQueryKey('add-ons', 'page-schema', 'get', {
        params: computed<PageSchemaGetParameters>(() => params.value),
        contextKey: computed(() => [params.value.schema, params.value.resource_type]),
    });

    return useScopedQuery({
        queryKey: computed(() => key.value),
        queryFn: () => pageSchemaAPI.get(queryParams.value),
        enabled: computed(() => !!params.value && (enabled?.value ?? true)),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
    }, ['DOMAIN', 'WORKSPACE']);
};
