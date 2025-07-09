import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useAgentApi } from '@/api-clients/identity/agent/composables/use-agent-api';
import type { AgentEnableParameters } from '@/api-clients/identity/agent/schema/api-verbs/enable';
import type { AgentModel } from '@/api-clients/identity/agent/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseServiceAccountAgentEnableMutationOptions {
    onSuccess?: (data: AgentModel, variables: AgentEnableParameters) => void|Promise<void>;
    onError?: (error: Error, variables: AgentEnableParameters) => void|Promise<void>;
    onSettled?: (data: AgentModel, error: Error|null, variables: AgentEnableParameters) => void|Promise<void>;
}

export const useServiceAccountAgentEnableMutation = ({ onSuccess, onError, onSettled }: UseServiceAccountAgentEnableMutationOptions = {}) => {
    const { agentAPI } = useAgentApi();
    const queryClient = useQueryClient();
    const { withSuffix } = useServiceQueryKey('identity', 'agent', 'get');
    return useMutation({
        mutationFn: (params: AgentEnableParameters) => {
            if (!params.service_account_id) throw new Error('Service Account ID is required');
            return agentAPI.enable(params);
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
