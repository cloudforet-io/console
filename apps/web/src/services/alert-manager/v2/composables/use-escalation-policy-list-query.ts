import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import { useEscalationPolicyApi } from '@/api-clients/alert-manager/escalation-policy/composables/use-escalation-policy-api';
import type { EscalationPolicyListParameters } from '@/api-clients/alert-manager/escalation-policy/schema/api-verbs/list';
import type { EscalationPolicyModel } from '@/api-clients/alert-manager/escalation-policy/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseEscalationPolicyListQueryReturn {
    escalationPolicyListData: Ref<EscalationPolicyModel[]>;
    escalationPolicyListTotalCount: Ref<number>;
    escalationPolicyListFetching: Ref<boolean>;
}
interface UseEscalationPolicyListQueryOptions {
    params: ComputedRef<EscalationPolicyListParameters>;
}

export const useEscalationPolicyListQuery = ({ params }: UseEscalationPolicyListQueryOptions): UseEscalationPolicyListQueryReturn => {
    const { escalationPolicyAPI } = useEscalationPolicyApi();

    const { key: escalationPolicyListQueryKey, params: escalationPolicyListQueryParams } = useServiceQueryKey('alert-manager', 'escalation-policy', 'list', {
        params: computed(() => params.value),
    });

    const { data: escalationPolicyListData, isFetching: escalationPolicyListFetching } = useScopedQuery({
        queryKey: escalationPolicyListQueryKey,
        queryFn: async () => escalationPolicyAPI.list(escalationPolicyListQueryParams.value),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
    }, ['WORKSPACE']);

    return {
        escalationPolicyListData: computed(() => escalationPolicyListData.value?.results ?? []),
        escalationPolicyListTotalCount: computed(() => escalationPolicyListData.value?.total_count ?? 0),
        escalationPolicyListFetching,
    };
};
