import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useAgentApi } from '@/api-clients/identity/agent/composables/use-agent-api';
import type { AgentRegenerateParameters } from '@/api-clients/identity/agent/schema/api-verbs/regenerate';
import type { AgentModel } from '@/api-clients/identity/agent/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseServiceAccountAgentRegenerateMutationOptions {
    onSuccess?: (data: AgentModel, variables: AgentRegenerateParameters) => void|Promise<void>;
    onError?: (error: Error, variables: AgentRegenerateParameters) => void|Promise<void>;
    onSettled?: (data: AgentModel | undefined, error: Error|null, variables: AgentRegenerateParameters) => void|Promise<void>;
}

export const useServiceAccountAgentRegenerateMutation = ({ onSuccess, onError, onSettled }: UseServiceAccountAgentRegenerateMutationOptions = {}) => {
    const { agentAPI } = useAgentApi();
    const queryClient = useQueryClient();
    const { withSuffix } = useServiceQueryKey('identity', 'agent', 'get');
    return useMutation({
        mutationFn: (params: AgentRegenerateParameters) => {
            if (!params.service_account_id) throw new Error('Service Account ID is required');
            return agentAPI.regenerate(params);
        },
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: withSuffix(variables.service_account_id) });
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
