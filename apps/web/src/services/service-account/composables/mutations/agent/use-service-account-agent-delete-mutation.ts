import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useAgentApi } from '@/api-clients/identity/agent/composables/use-agent-api';
import type { AgentDeleteParameters } from '@/api-clients/identity/agent/schema/api-verbs/delete';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseServiceAccountAgentDeleteMutationOptions {
    onSuccess?: (data: void, variables: AgentDeleteParameters) => void|Promise<void>;
    onError?: (error: Error, variables: AgentDeleteParameters) => void|Promise<void>;
    onSettled?: (data: void, error: Error|null, variables: AgentDeleteParameters) => void|Promise<void>;
}

export const useServiceAccountAgentDeleteMutation = ({ onSuccess, onError, onSettled }: UseServiceAccountAgentDeleteMutationOptions = {}) => {
    const { agentAPI } = useAgentApi();
    const queryClient = useQueryClient();
    const { withSuffix } = useServiceQueryKey('identity', 'agent', 'get');
    return useMutation({
        mutationFn: (params: AgentDeleteParameters) => {
            if (!params.service_account_id) throw new Error('Service Account ID is required');
            return agentAPI.delete(params);
        },
        onSuccess: async (data, variables) => {
            queryClient.resetQueries({ queryKey: withSuffix(variables.service_account_id) });
            if (onSuccess) await onSuccess(data, variables);
        },
        onError: async (error, variables) => {
            if (onError) await onError(error, variables);
        },
        onSettled: async (data, error, variables) => {
            if (onSettled) await onSettled(data, error, variables);
        },
    });
};
