import type { Ref } from 'vue';
import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { useEventRuleApi } from '@/api-clients/alert-manager/event-rule/composables/use-event-rule-api';
import type { EventRuleModel } from '@/api-clients/alert-manager/event-rule/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';

interface UseEventRuleListQueryReturn {
    eventRuleListData: Ref<EventRuleModel[]>;
    eventRuleListFetching: Ref<boolean>;
    eventRuleListQueryKey: Ref<QueryKey>;
}

export const useEventRuleListQuery = (): UseEventRuleListQueryReturn => {
    const serviceDetailPageStore = useServiceDetailPageStore();
    const serviceDetailPageState = serviceDetailPageStore.state;

    const { eventRuleAPI } = useEventRuleApi();

    const serviceId = computed<string>(() => serviceDetailPageState.serviceInfo.service_id);

    const { key: eventRuleListQueryKey, params: eventRuleListQueryParams } = useServiceQueryKey('alert-manager', 'event-rule', 'list', {
        params: computed(() => ({
            service_id: serviceId.value,
        })),
    });

    const { data: queryData, isFetching: eventRuleListFetching } = useScopedQuery({
        queryKey: eventRuleListQueryKey,
        queryFn: async () => eventRuleAPI.list(eventRuleListQueryParams.value),
        enabled: computed(() => !!serviceId.value),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 2,
    }, ['WORKSPACE']);

    return {
        eventRuleListData: computed(() => queryData.value?.results ?? []),
        eventRuleListFetching,
        eventRuleListQueryKey,
    };
};
