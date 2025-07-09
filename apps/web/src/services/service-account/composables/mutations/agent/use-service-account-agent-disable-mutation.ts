import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useAgentApi } from '@/api-clients/identity/agent/composables/use-agent-api';
import type { AgentDisableParameters } from '@/api-clients/identity/agent/schema/api-verbs/disable';
import type { AgentModel } from '@/api-clients/identity/agent/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseServiceAccountAgentDisableMutationOptions {
    onSuccess?: (data: AgentModel, variables: AgentDisableParameters) => void|Promise<void>;
    onError?: (error: Error, variables: AgentDisableParameters) => void|Promise<void>;
    onSettled?: (data: AgentModel, error: Error|null, variables: AgentDisableParameters) => void|Promise<void>;
}

export const useServiceAccountAgentDisableMutation = ({ onSuccess, onError, onSettled }: UseServiceAccountAgentDisableMutationOptions = {}) => {
    const { agentAPI } = useAgentApi();
    const queryClient = useQueryClient();
    const { withSuffix } = useServiceQueryKey('identity', 'agent', 'get');
    return useMutation({
        mutationFn: (params: AgentDisableParameters) => {
            if (!params.service_account_id) throw new Error('Service Account ID is required');
            return agentAPI.disable(params);
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
