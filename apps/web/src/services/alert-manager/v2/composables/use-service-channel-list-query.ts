import type { Ref } from 'vue';
import { computed } from 'vue';

import { useServiceChannelApi } from '@/api-clients/alert-manager/service-channel/composables/use-service-channel-api';
import type { ServiceChannelModel } from '@/api-clients/alert-manager/service-channel/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useServiceDetailPageStore } from '../stores/service-detail-page-store';

interface UseServiceChannelListQueryReturn {
    serviceChannelListData: Ref<ServiceChannelModel[]>;
    serviceChannelListFetching: Ref<boolean>;
}

export const useServiceChannelListQuery = (): UseServiceChannelListQueryReturn => {
    const serviceDetailPageStore = useServiceDetailPageStore();
    const serviceDetailPageGetters = serviceDetailPageStore.getters;

    const { serviceChannelAPI } = useServiceChannelApi();

    const serviceId = computed<string>(() => serviceDetailPageGetters.serviceInfo.service_id);

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
