import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { usePrivateDataTableApi } from '@/api-clients/dashboard/private-data-table/composables/use-private-data-table-api';
import { usePublicDataTableApi } from '@/api-clients/dashboard/public-data-table/composables/use-public-data-table-api';
import type { DataTableTransformParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/transform';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';

interface UseDataTableTransformMutationOptions {
    widgetId: ComputedRef<string|undefined>;
    onSuccess?: (data: DataTableModel, variables: DataTableTransformParameters) => Promise<void> | void;
    onError?: (error: Error, variables: DataTableTransformParameters) => Promise<void> | void;
    onSettled?: (data: DataTableModel|undefined, error: Error | null, variables: DataTableTransformParameters) => Promise<void> | void;
}


export const useDataTableTransformMutation = ({
    widgetId,
    onSuccess,
    onError,
    onSettled,
}: UseDataTableTransformMutationOptions) => {
    const queryClient = useQueryClient();
    const { publicDataTableAPI } = usePublicDataTableApi();
    const { privateDataTableAPI } = usePrivateDataTableApi();


    const { key: publicDataTableListQueryKey } = useServiceQueryKey('dashboard', 'public-data-table', 'list', {
        contextKey: computed(() => widgetId.value),
    });
    const { key: privateDataTableListQueryKey } = useServiceQueryKey('dashboard', 'private-data-table', 'list', {
        contextKey: computed(() => widgetId.value),
    });

    const dataTableTransformFn = (params: DataTableTransformParameters): Promise<DataTableModel> => {
        if (params.widget_id.startsWith('private')) {
            return privateDataTableAPI.transform(params);
        }
        return publicDataTableAPI.transform(params);
    };

    return useMutation({
        mutationFn: dataTableTransformFn,
        onSuccess: async (data, variables) => {
            const _isPrivate = widgetId.value?.startsWith('private');
            const dataTableListQueryKey = _isPrivate ? privateDataTableListQueryKey : publicDataTableListQueryKey;
            await queryClient.invalidateQueries({ queryKey: dataTableListQueryKey.value });
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
