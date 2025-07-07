import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { usePageSchemaApi } from '@/api-clients/add-ons/page-schema/composables/use-page-schema-api';
import type { PageSchemaUpdateParameters } from '@/api-clients/add-ons/page-schema/schema/api-verbs/update';
import type { PageSchemaModel } from '@/api-clients/add-ons/page-schema/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseCloudServicePageSchemaUpdateMutationOptions {
    onSuccess?: (data: PageSchemaModel, variables: PageSchemaUpdateParameters) => void;
    onError?: (error: Error, variables: PageSchemaUpdateParameters) => void;
    onSettled?: (data: PageSchemaModel|undefined, error: Error|null, variables: PageSchemaUpdateParameters) => void;
}

export const useCloudServicePageSchemaUpdateMutation = (options: UseCloudServicePageSchemaUpdateMutationOptions) => {
    const { onSuccess, onError, onSettled } = options;
    const { pageSchemaAPI } = usePageSchemaApi();
    const queryClient = useQueryClient();
    const { withSuffix } = useServiceQueryKey('add-ons', 'page-schema', 'get');

    return useMutation({
        mutationFn: (params: PageSchemaUpdateParameters) => {
            if (!params.resource_type || !params.schema) {
                throw new Error('resource_type and schema are required');
            }
            return pageSchemaAPI.update(params);
        },
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: withSuffix([variables.schema, variables.resource_type]) });
            if (onSuccess) onSuccess(data, variables);
        },
        onError: async (_error, variables) => {
            if (onError) onError(_error, variables);
        },
        onSettled: async (data, _error, variables) => {
            if (onSettled) onSettled(data, _error, variables);
        },
    });
};
