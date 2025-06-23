import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router/composables';

import { useEventRuleApi } from '@/api-clients/alert-manager/event-rule/composables/use-event-rule-api';
import type { EventRuleModel } from '@/api-clients/alert-manager/event-rule/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import type { QueryKeyArray } from '@/query/query-key/_types/query-key-type';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

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
        staleTime: 1000 * 30,
    }, ['WORKSPACE']);

    return {
        eventRuleData,
        eventRuleLoading,
        eventRuleQueryKey,
    };
};
