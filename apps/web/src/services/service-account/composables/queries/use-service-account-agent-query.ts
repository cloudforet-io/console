import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useAgentApi } from '@/api-clients/identity/agent/composables/use-agent-api';
import type { AgentGetParameters } from '@/api-clients/identity/agent/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseServiceAccountAgentQueryOptions {
    params: ComputedRef<AgentGetParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useServiceAccountAgentQuery = ({ params, enabled }: UseServiceAccountAgentQueryOptions) => {
    const { agentAPI } = useAgentApi();
    const { key, params: agentParams } = useServiceQueryKey('identity', 'agent', 'get', {
        params,
        contextKey: computed(() => params.value.service_account_id),
    });
    return useScopedQuery({
        queryKey: key,
        queryFn: () => agentAPI.get(agentParams.value),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
        retry: 1,
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
    }, ['DOMAIN', 'WORKSPACE']);
};
