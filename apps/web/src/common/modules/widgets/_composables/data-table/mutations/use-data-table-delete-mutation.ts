import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { usePrivateDataTableApi } from '@/api-clients/dashboard/private-data-table/composables/use-private-data-table-api';
import { usePublicDataTableApi } from '@/api-clients/dashboard/public-data-table/composables/use-public-data-table-api';
import type { DataTableDeleteParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/delete';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';

interface UseDataTableDeleteMutationOptions {
    widgetId: ComputedRef<string|undefined>;
    onSuccess?: (data: undefined, variables: DataTableDeleteParameters) => Promise<void> | void;
    onError?: (error: Error, variables: DataTableDeleteParameters) => Promise<void> | void;
    onSettled?: (data: undefined, error: Error | null, variables: DataTableDeleteParameters) => Promise<void> | void;
}


export const useDataTableDeleteMutation = ({
    widgetId,
    onSuccess,
    onError,
    onSettled,
}: UseDataTableDeleteMutationOptions) => {
    const queryClient = useQueryClient();
    const { publicDataTableAPI } = usePublicDataTableApi();
    const { privateDataTableAPI } = usePrivateDataTableApi();


    const { key: publicDataTableListQueryKey } = useServiceQueryKey('dashboard', 'public-data-table', 'list', {
        contextKey: computed(() => widgetId.value),
        params: computed(() => ({
            widget_id: widgetId.value,
        })),
    });
    const { key: privateDataTableListQueryKey } = useServiceQueryKey('dashboard', 'private-data-table', 'list', {
        contextKey: computed(() => widgetId.value),
        params: computed(() => ({
            widget_id: widgetId.value,
        })),
    });

    const dataTableDeleteFn = (params: DataTableDeleteParameters): Promise<void> => {
        if (params.data_table_id.startsWith('private')) {
            return privateDataTableAPI.delete(params);
        }
        return publicDataTableAPI.delete(params);
    };

    return useMutation({
        mutationFn: dataTableDeleteFn,
        onSuccess: async (_, variables) => {
            const _isPrivate = widgetId.value?.startsWith('private');
            const dataTableListQueryKey = _isPrivate ? privateDataTableListQueryKey : publicDataTableListQueryKey;
            await queryClient.setQueryData(dataTableListQueryKey.value, (oldData: ListResponse<DataTableModel>) => {
                if (oldData?.results) {
                    return {
                        ...oldData,
                        results: oldData.results.filter((dataTable) => dataTable.data_table_id !== variables.data_table_id),
                    };
                }
                return oldData;
            });
            if (onSuccess) await onSuccess(undefined, variables);
        },
        onError: async (error, variables) => {
            if (onError) await onError(error, variables);
        },
        onSettled: async (_, error, variables) => {
            if (onSettled) await onSettled(undefined, error, variables);
        },
    });
};
