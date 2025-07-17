import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { useWebhookApi } from '@/api-clients/alert-manager/webhook/composables/use-webhook-api';
import type { WebhookModel } from '@/api-clients/alert-manager/webhook/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseWebhookListQueryReturn {
    webhookListData: Ref<WebhookModel[]>;
    webhookListTotalCount: Ref<number>;
    webhookListFetching: Ref<boolean>;
    webhookListQueryKey: Ref<QueryKey>;
}

export const useWebhookListQuery = (serviceId: ComputedRef<string>): UseWebhookListQueryReturn => {
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
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
    }, ['WORKSPACE']);

    return {
        webhookListData: computed<WebhookModel[]>(() => queryData.value?.results ?? []),
        webhookListTotalCount: computed<number>(() => queryData.value?.total_count ?? 0),
        webhookListFetching,
        webhookListQueryKey,
    };
};
