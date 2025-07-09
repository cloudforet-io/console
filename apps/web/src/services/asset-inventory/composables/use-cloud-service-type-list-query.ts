import type { MaybeRef } from '@vueuse/core';
import { toValue } from '@vueuse/core';
import { computed } from 'vue';

import { uniqBy } from 'lodash';

import { useCloudServiceTypeApi } from '@/api-clients/inventory/cloud-service-type/composables/use-cloud-service-type-api';
import type { CloudServiceTypeListParameters } from '@/api-clients/inventory/cloud-service-type/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


const DEFAULT_LIST_DATA = { results: [] };
interface UseCloudServiceTypeListQueryOptions {
    params: MaybeRef<CloudServiceTypeListParameters>;
    enabled?: MaybeRef<boolean>;
}


export const useCloudServiceTypeListQuery = ({ params, enabled }: UseCloudServiceTypeListQueryOptions) => {
    const { cloudServiceTypeAPI } = useCloudServiceTypeApi();

    const { key, params: queryParams } = useServiceQueryKey('inventory', 'cloud-service-type', 'list', {
        params: computed(() => toValue(params)),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => cloudServiceTypeAPI.list(queryParams.value),
        select: (data) => uniqBy(data.results || [], 'cloud_service_type_key'),
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        enabled: computed(() => (toValue(enabled) ?? true)),
    }, ['DOMAIN', 'WORKSPACE']);
};
