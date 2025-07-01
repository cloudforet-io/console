import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useCloudServiceTypeApi } from '@/api-clients/inventory/cloud-service-type/composables/use-cloud-service-type-api';
import type { CloudServiceTypeListParameters } from '@/api-clients/inventory/cloud-service-type/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { getCloudServiceTypeQuery } from '@/services/asset-inventory/helpers/cloud-service-type-list-helper';

const DEFAULT_LIST_DATA = { results: [] };

interface UseCloudServiceTypeListQueryOptions {
    provider: ComputedRef<string>;
    group: ComputedRef<string>;
    name: ComputedRef<string | undefined>;
}

export const useCloudServiceTypeListQuery = (options: UseCloudServiceTypeListQueryOptions) => {
    const { provider, group, name } = options;
    const { cloudServiceTypeAPI } = useCloudServiceTypeApi();

    const { key, params } = useServiceQueryKey('inventory', 'cloud-service-type', 'list', {
        params: computed<CloudServiceTypeListParameters>(() => ({
            query: getCloudServiceTypeQuery(provider.value, group.value),
        })),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => cloudServiceTypeAPI.list(params.value),
        select: (data) => data.results || [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        enabled: computed(() => !!provider.value && !!group.value && !!name.value),
    }, ['DOMAIN', 'WORKSPACE']);
};
