import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { useEventRuleApi } from '@/api-clients/alert-manager/event-rule/composables/use-event-rule-api';
import type { EventRuleModel } from '@/api-clients/alert-manager/event-rule/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseEventRuleListQueryReturn {
    eventRuleListData: Ref<EventRuleModel[]>;
    eventRuleListFetching: Ref<boolean>;
    eventRuleListQueryKey: Ref<QueryKey>;
}

export const useEventRuleListQuery = (serviceId: ComputedRef<string>): UseEventRuleListQueryReturn => {
    const { eventRuleAPI } = useEventRuleApi();

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
