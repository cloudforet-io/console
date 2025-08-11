import type { ComputedRef } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import type { UserConfigCreateParameters } from '@/api-clients/config/user-config/schema/api-verbs/create';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import { getCustomTableSchemaKey } from '@/common/modules/custom-table/custom-field-modal/utils/custom-table-schema-helpers';

import type {
    ResourceType, QuerySearchTableLayout,
} from '@/services/service-account/helpers/dynamic-ui-schema-generator/type';





interface UseCustomTableSchemaCreateMutationOptions {
    userData: ComputedRef<{ userType: string, userId: string }>;
    resourceType: ComputedRef<ResourceType|undefined>;
    provider: ComputedRef<string>;
    onSuccess?: (data: UserConfigModel<QuerySearchTableLayout>, variables: UserConfigCreateParameters) => void|Promise<void>;
    onError?: (error: Error, variables: UserConfigCreateParameters) => void|Promise<void>;
    onSettled?: (data: UserConfigModel<QuerySearchTableLayout>|undefined, error: Error|null, variables: UserConfigCreateParameters) => void|Promise<void>;
}


export const useCustomTableSchemaCreate = (options: UseCustomTableSchemaCreateMutationOptions) => {
    const { userConfigAPI } = useUserConfigApi();

    const {
        userData, resourceType, provider,
        onSuccess, onError, onSettled,
    } = options;

    const queryClient = useQueryClient();
    const { withSuffix } = useServiceQueryKey('config', 'user-config', 'list');

    const { mutate, isPending, error } = useMutation({
        mutationFn: (params: UserConfigCreateParameters) => userConfigAPI.create<QuerySearchTableLayout>(params),
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
        createCustomTableSchema: async (data: QuerySearchTableLayout) => {
            const params: UserConfigCreateParameters = {
                name: getCustomTableSchemaKey(userData.value, resourceType.value, provider.value),
                data,
            };
            return mutate(params);
        },
        isPending,
        error,
    };
};
