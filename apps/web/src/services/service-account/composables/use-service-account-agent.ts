import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useServiceAccountAgentQuery } from './queries/use-service-account-agent-query';

interface UseServiceAccountAgentOptions {
    serviceAccountId: ComputedRef<string>;
}

export const useServiceAccountAgent = ({ serviceAccountId }: UseServiceAccountAgentOptions) => {
    const { data: agentData, isLoading: isLoadingAgent } = useServiceAccountAgentQuery({
        params: computed(() => ({
            service_account_id: serviceAccountId.value,
        })),
        enabled: computed(() => !!serviceAccountId.value),
    });

    return {
        agentData,
        isLoading: isLoadingAgent,
        isAgentCreated: computed(() => !!agentData.value),
        isClusterConnected: computed(() => !!agentData.value?.last_accessed_at),
        currentAppToken: computed(() => agentData.value?.client_secret || ''),
    };
};
