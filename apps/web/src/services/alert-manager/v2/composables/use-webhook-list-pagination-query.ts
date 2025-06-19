import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import type { AlertListParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/list';
import { useWebhookApi } from '@/api-clients/alert-manager/webhook/composables/use-webhook-api';
import type { WebhookModel } from '@/api-clients/alert-manager/webhook/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseWebhookListPaginationQueryOptions {
    params: ComputedRef<AlertListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useWebhookListPaginationQuery = ({ params, thisPage, pageSize }: UseWebhookListPaginationQueryOptions) => {
    const queryClient = useQueryClient();

    const { webhookAPI } = useWebhookApi();


    const { key: webhookListPaginationQueryKey, params: webhookListPaginationQueryParams } = useServiceQueryKey('alert-manager', 'webhook', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const query = useScopedPaginationQuery({
        queryKey: webhookListPaginationQueryKey,
        queryFn: webhookAPI.list,
        params: webhookListPaginationQueryParams,
        gcTime: 1000 * 60 * 2,
        enabled: true,
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['WORKSPACE']);


    const refresh = async () => {
        await queryClient.resetQueries({ queryKey: webhookListPaginationQueryKey.value });
    };

    return {
        data: computed<WebhookModel[]>(() => query.data.value?.results || []),
        totalCount: computed<number>(() => query.data.value?.total_count || 0),
        isLoading: query.isLoading,
        refresh,
    };
};
