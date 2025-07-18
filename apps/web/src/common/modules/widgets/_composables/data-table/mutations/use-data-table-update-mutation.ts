import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { usePrivateDataTableApi } from '@/api-clients/dashboard/private-data-table/composables/use-private-data-table-api';
import { usePublicDataTableApi } from '@/api-clients/dashboard/public-data-table/composables/use-public-data-table-api';
import type { DataTableUpdateParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/update';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';




interface UseDataTableUpdateMutationOptions {
    widgetId: ComputedRef<string|undefined>;
    onSuccess?: (data: DataTableModel, variables: DataTableUpdateParameters) => Promise<void> | void;
    onError?: (error: Error, variables: DataTableUpdateParameters) => Promise<void> | void;
    onSettled?: (data: DataTableModel|undefined, error: Error | null, variables: DataTableUpdateParameters) => Promise<void> | void;
}


export const useDataTableUpdateMutation = ({
    widgetId,
    onSuccess,
    onError,
    onSettled,
}: UseDataTableUpdateMutationOptions) => {
    const queryClient = useQueryClient();
    const { publicDataTableAPI } = usePublicDataTableApi();
    const { privateDataTableAPI } = usePrivateDataTableApi();

    /* Query Keys */
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
    const { withSuffix: privateDataTableGetQueryKey } = useServiceQueryKey('dashboard', 'private-data-table', 'get');
    const { withSuffix: publicDataTableGetQueryKey } = useServiceQueryKey('dashboard', 'public-data-table', 'get');

    /* Fetchers */
    const dataTableUpdateFn = (params: DataTableUpdateParameters): Promise<DataTableModel> => {
        if (params.data_table_id.startsWith('private')) {
            return privateDataTableAPI.update(params);
        }
        return publicDataTableAPI.update(params);
    };

    /* Mutation */
    return useMutation({
        mutationFn: dataTableUpdateFn,
        onSuccess: async (data, variables) => {
            const _isPrivate = widgetId.value?.startsWith('private');
            const dataTableListQueryKey = _isPrivate ? privateDataTableListQueryKey : publicDataTableListQueryKey;
            /* Update Data Table List Query */
            await queryClient.setQueryData(dataTableListQueryKey.value, (oldData: ListResponse<DataTableModel>) => {
                if (oldData?.results) {
                    return {
                        ...oldData,
                        results: oldData.results.map((dataTable) => {
                            if (dataTable.data_table_id === data.data_table_id) {
                                return data;
                            }
                            return dataTable;
                        }),
                    };
                }
                return oldData;
            });

            /* Update Data Table Get Query */
            await queryClient.invalidateQueries({ queryKey: _isPrivate ? privateDataTableGetQueryKey(data.data_table_id) : publicDataTableGetQueryKey(data.data_table_id) });
            if (onSuccess) onSuccess(data, variables);
        },
        onError: async (error, variables) => {
            if (onError) await onError(error, variables);
        },
        onSettled: async (data, error, variables) => {
            if (onSettled) await onSettled(data, error, variables);
        },
    });
};
