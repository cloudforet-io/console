import type { ComputedRef } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import type { UserConfigUpdateParameters } from '@/api-clients/config/user-config/schema/api-verbs/update';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import { getCustomTableSchemaKey } from '@/common/modules/custom-table/custom-field-modal/utils/custom-table-schema-helpers';

import type {
    ResourceType, QuerySearchTableLayout,
} from '@/services/service-account/helpers/dynamic-ui-schema-generator/type';





interface UseCustomTableSchemaUpdateMutationOptions {
    userData: ComputedRef<{ userType: string, userId: string }>;
    resourceType: ComputedRef<ResourceType|undefined>;
    provider: ComputedRef<string>;
    onSuccess?: (data: UserConfigModel<QuerySearchTableLayout>, variables: UserConfigUpdateParameters) => void|Promise<void>;
    onError?: (error: Error, variables: UserConfigUpdateParameters) => void|Promise<void>;
    onSettled?: (data: UserConfigModel<QuerySearchTableLayout>|undefined, error: Error|null, variables: UserConfigUpdateParameters) => void|Promise<void>;
}


export const useCustomTableSchemaUpdate = (options: UseCustomTableSchemaUpdateMutationOptions) => {
    const { userConfigAPI } = useUserConfigApi();

    const {
        userData, resourceType, provider,
        onSuccess, onError, onSettled,
    } = options;

    const queryClient = useQueryClient();
    const { withSuffix } = useServiceQueryKey('config', 'user-config', 'list');

    const { mutateAsync, isPending, error } = useMutation({
        mutationFn: (params: UserConfigUpdateParameters) => userConfigAPI.update<QuerySearchTableLayout>(params),
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: withSuffix(variables) });
            if (onSuccess) await onSuccess(data, variables);
        },
        onError: async (_error, variables) => {
            if (onError) await onError(_error, variables);
        },
        onSettled: async (data, _error, variables) => {
            if (onSettled) await onSettled(data, _error, variables);
        },
    });

    return {
        updateCustomTableSchema: async (data: QuerySearchTableLayout) => {
            const params: UserConfigUpdateParameters = {
                name: getCustomTableSchemaKey(userData.value, resourceType.value, provider.value),
                data,
            };
            return mutateAsync(params);
        },
        isPending,
        error,
    };
};
