import { useMutation, useQueryClient } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { usePrivateDataTableApi } from '@/api-clients/dashboard/private-data-table/composables/use-private-data-table-api';
import { usePublicDataTableApi } from '@/api-clients/dashboard/public-data-table/composables/use-public-data-table-api';
import type { DataTableAddParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/add';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';

interface UseDataTableAddMutationOptions {
    onSuccess?: (data: DataTableModel, variables: DataTableAddParameters) => Promise<void> | void;
    onError?: (error: Error, variables: DataTableAddParameters) => Promise<void> | void;
    onSettled?: (data: DataTableModel|undefined, error: Error | null, variables: DataTableAddParameters) => Promise<void> | void;
}


export const useDataTableAddMutation = ({
    onSuccess,
    onError,
    onSettled,
}: UseDataTableAddMutationOptions) => {
    const queryClient = useQueryClient();
    const { publicDataTableAPI } = usePublicDataTableApi();
    const { privateDataTableAPI } = usePrivateDataTableApi();


    const { withSuffix: publicDataTableListQueryKey } = useServiceQueryKey('dashboard', 'public-data-table', 'list');
    const { withSuffix: privateDataTableListQueryKey } = useServiceQueryKey('dashboard', 'private-data-table', 'list');

    const dataTableAddFn = (params: DataTableAddParameters): Promise<DataTableModel> => {
        if (params.widget_id.startsWith('private')) {
            return privateDataTableAPI.add(params);
        }
        return publicDataTableAPI.add(params);
    };

    return useMutation({
        mutationFn: dataTableAddFn,
        onSuccess: async (data, variables) => {
            const _isPrivate = variables.widget_id.startsWith('private');
            const dataTableListQueryKey = _isPrivate ? privateDataTableListQueryKey(variables.widget_id) : publicDataTableListQueryKey(variables.widget_id);
            const currentData = queryClient.getQueryData<ListResponse<DataTableModel>>(dataTableListQueryKey);
            if (!currentData) {
                await queryClient.invalidateQueries({ queryKey: dataTableListQueryKey });
            } else {
                await queryClient.setQueryData(dataTableListQueryKey, (oldData: ListResponse<DataTableModel>) => {
                    if (oldData?.results) {
                        return {
                            ...oldData,
                            results: [...oldData.results, data],
                        };
                    }
                    return {
                        ...(oldData ?? {}),
                        results: [data],
                    };
                });
            }
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
