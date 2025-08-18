import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router/composables';

import { useEventRuleApi } from '@/api-clients/alert-manager/event-rule/composables/use-event-rule-api';
import type { EventRuleModel } from '@/api-clients/alert-manager/event-rule/schema/model';
import type { QueryKeyArray } from '@/query/core/query-key/types/query-key-type';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


interface UseEventRuleGetQueryReturn {
    eventRuleData: Ref<EventRuleModel | undefined>;
    eventRuleLoading: Ref<boolean>;
    eventRuleQueryKey: ComputedRef<QueryKeyArray>;
}

export const useEventRuleGetQuery = (): UseEventRuleGetQueryReturn => {
    const { eventRuleAPI } = useEventRuleApi();
    const route = useRoute();

    const eventRuleId = computed(() => route.query?.eventRuleId as string);

    const { key: eventRuleQueryKey, params: eventRuleQueryParams } = useServiceQueryKey('alert-manager', 'event-rule', 'get', {
        params: computed(() => ({
            event_rule_id: eventRuleId.value,
        })),
    });

    const { data: eventRuleData, isFetching: eventRuleLoading } = useScopedQuery({
        queryKey: eventRuleQueryKey,
        queryFn: () => eventRuleAPI.get(eventRuleQueryParams.value),
        enabled: computed(() => !!eventRuleId.value),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 2,
    }, ['WORKSPACE']);

    return {
        eventRuleData,
        eventRuleLoading,
        eventRuleQueryKey,
    };
};
