import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import { useServiceChannelApi } from '@/api-clients/alert-manager/service-channel/composables/use-service-channel-api';
import type { ServiceChannelModel } from '@/api-clients/alert-manager/service-channel/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseServiceChannelListQueryReturn {
    serviceChannelListData: Ref<ServiceChannelModel[]>;
    serviceChannelListFetching: Ref<boolean>;
}

export const useServiceChannelListQuery = (serviceId: ComputedRef<string>): UseServiceChannelListQueryReturn => {
    const { serviceChannelAPI } = useServiceChannelApi();

    const { key: serviceChannelListQueryKey, params: serviceChannelListQueryParams } = useServiceQueryKey('alert-manager', 'service-channel', 'list', {
        params: computed(() => ({
            service_id: serviceId.value,
            query: {
                sort: [{ key: 'created_at', desc: true }],
            },
        })),
    });

    const { data: queryData, isFetching: serviceChannelListFetching } = useScopedQuery({
        queryKey: serviceChannelListQueryKey,
        queryFn: async () => serviceChannelAPI.list(serviceChannelListQueryParams.value),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
    }, ['WORKSPACE']);

    return {
        serviceChannelListData: computed<ServiceChannelModel[]>(() => queryData.value?.results ?? []),
        serviceChannelListFetching,
    };
};
