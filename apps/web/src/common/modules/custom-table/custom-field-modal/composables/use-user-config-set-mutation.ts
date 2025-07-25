import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import type { UserConfigSetParameters } from '@/api-clients/config/user-config/schema/api-verbs/set';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UserConfigSetMutationOptions {
    onSuccess?: (data: UserConfigModel, variables: UserConfigSetParameters) => Promise<void> | void;
    onError?: (error: Error, variables: UserConfigSetParameters) => Promise<void> | void;
    onSettled?: (data: UserConfigModel | undefined, error: Error | null, variables: UserConfigSetParameters) => Promise<void> | void;
}

export const useUserConfigSetMutation = ({ onSuccess, onError, onSettled }: UserConfigSetMutationOptions) => {
    const { userConfigAPI } = useUserConfigApi();
    const { withSuffix: withSuffixGet } = useServiceQueryKey('config', 'user-config', 'get');
    const { key: listKey } = useServiceQueryKey('config', 'user-config', 'list');
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: UserConfigSetParameters) => userConfigAPI.set(params),
        onSuccess: async (data, variables) => {
            await queryClient.invalidateQueries({ queryKey: withSuffixGet(variables.name) });
            await queryClient.invalidateQueries({ queryKey: listKey.value });
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
