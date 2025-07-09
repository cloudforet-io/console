import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useAgentApi } from '@/api-clients/identity/agent/composables/use-agent-api';
import type { AgentRegenerateParameters } from '@/api-clients/identity/agent/schema/api-verbs/regenerate';
import type { AgentModel } from '@/api-clients/identity/agent/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseServiceAccountAgentRegenerateMutationOptions {
    onSuccess?: (data: AgentModel, variables: AgentRegenerateParameters) => void|Promise<void>;
    onError?: (error: Error, variables: AgentRegenerateParameters) => void|Promise<void>;
    onSettled?: (data: AgentModel, error: Error|null, variables: AgentRegenerateParameters) => void|Promise<void>;
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
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: withSuffix(variables.service_account_id) });
            if (onSuccess) onSuccess(data, variables);
        },
        onError: (error, variables) => {
            if (onError) onError(error, variables);
        },
        onSettled: (data, error, variables) => {
            if (onSettled) onSettled(data, error, variables);
        },
    });
};
