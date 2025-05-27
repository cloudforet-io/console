import type { Ref } from 'vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router/composables';

import { useEventRuleApi } from '@/api-clients/alert-manager/event-rule/composables/use-event-rule-api';
import type { EventRuleModel } from '@/api-clients/alert-manager/event-rule/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

interface UseEventRuleGetQueryReturn {
    eventRuleData: Ref<EventRuleModel | undefined>;
    eventRuleLoading: Ref<boolean>;
}

export const useEventRuleGetQuery = (): UseEventRuleGetQueryReturn => {
    const { eventRuleAPI } = useEventRuleApi();
    const route = useRoute();

    const { key: eventRuleQueryKey, params: eventRuleQueryParams } = useServiceQueryKey('alert-manager', 'event-rule', 'get', {
        params: computed(() => ({
            event_rule_id: route.query?.eventRuleId as string,
        })),
    });

    const { data: eventRuleData, isFetching: eventRuleLoading } = useScopedQuery({
        queryKey: eventRuleQueryKey,
        queryFn: () => eventRuleAPI.get(eventRuleQueryParams.value),
        enabled: !!route.query?.eventRuleId,
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 30,
    }, ['WORKSPACE']);

    return {
        eventRuleData,
        eventRuleLoading,
    };
};
