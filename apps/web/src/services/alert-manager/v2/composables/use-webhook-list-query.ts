import type { Ref } from 'vue';
import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { useWebhookApi } from '@/api-clients/alert-manager/webhook/composables/use-webhook-api';
import type { WebhookModel } from '@/api-clients/alert-manager/webhook/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useServiceDetailPageStore } from '../stores/service-detail-page-store';

interface UseWebhookListQueryReturn {
    webhookListData: Ref<WebhookModel[]>;
    webhookListTotalCount: Ref<number>;
    webhookListFetching: Ref<boolean>;
    webhookListQueryKey: Ref<QueryKey>;
}

export const useWebhookListQuery = (): UseWebhookListQueryReturn => {
    const serviceDetailPageStore = useServiceDetailPageStore();
    const serviceDetailPageGetters = serviceDetailPageStore.getters;
    const serviceId = computed<string>(() => serviceDetailPageGetters.serviceInfo.service_id);

    const { webhookAPI } = useWebhookApi();

    const { key: webhookListQueryKey, params: webhookListQueryParams } = useServiceQueryKey('alert-manager', 'webhook', 'list', {
        params: computed(() => ({
            service_id: serviceId.value,
            query: {
                sort: [{ key: 'created_at', desc: true }],
            },
        })),
    });

    const { data: queryData, isFetching: webhookListFetching } = useScopedQuery({
        queryKey: webhookListQueryKey,
        queryFn: async () => webhookAPI.list(webhookListQueryParams.value),
        initialData: {
            results: [],
            total_count: 0,
        },
        gcTime: 1000 * 60 * 2,
    }, ['WORKSPACE']);

    return {
        webhookListData: computed<WebhookModel[]>(() => queryData.value?.results ?? []),
        webhookListTotalCount: computed<number>(() => queryData.value?.total_count ?? 0),
        webhookListFetching,
        webhookListQueryKey,
    };
};
