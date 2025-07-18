import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

// import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { usePrivateDataTableApi } from '@/api-clients/dashboard/private-data-table/composables/use-private-data-table-api';
import { usePublicDataTableApi } from '@/api-clients/dashboard/public-data-table/composables/use-public-data-table-api';
import type { DataTableAddParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/add';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';

interface UseDataTableAddMutationOptions {
    widgetId: ComputedRef<string|undefined>;
    onSuccess?: (data: DataTableModel, variables: DataTableAddParameters) => Promise<void> | void;
    onError?: (error: Error, variables: DataTableAddParameters) => Promise<void> | void;
    onSettled?: (data: DataTableModel|undefined, error: Error | null, variables: DataTableAddParameters) => Promise<void> | void;
}


export const useDataTableAddMutation = ({
    widgetId,
    onSuccess,
    onError,
    onSettled,
}: UseDataTableAddMutationOptions) => {
    const queryClient = useQueryClient();
    const { publicDataTableAPI } = usePublicDataTableApi();
    const { privateDataTableAPI } = usePrivateDataTableApi();


    const { key: publicDataTableListQueryKey } = useServiceQueryKey('dashboard', 'public-data-table', 'list', {
        contextKey: computed(() => widgetId.value),
    });
    const { key: privateDataTableListQueryKey } = useServiceQueryKey('dashboard', 'private-data-table', 'list', {
        contextKey: computed(() => widgetId.value),
    });

    const dataTableAddFn = (params: DataTableAddParameters): Promise<DataTableModel> => {
        if (params.widget_id.startsWith('private')) {
            return privateDataTableAPI.add(params);
        }
        return publicDataTableAPI.add(params);
    };

    return useMutation({
        mutationFn: dataTableAddFn,
        onSuccess: (data, variables) => {
            const _isPrivate = widgetId.value?.startsWith('private');
            const dataTableListQueryKey = _isPrivate ? privateDataTableListQueryKey : publicDataTableListQueryKey;
            queryClient.invalidateQueries({ queryKey: dataTableListQueryKey });
            // queryClient.setQueryData(dataTableListQueryKey.value, (oldData: ListResponse<DataTableModel>) => (oldData?.results?.length ? {
            //     ...oldData, results: [...oldData.results, data],
            // } : {
            //     ...(oldData ?? {}), results: [data],
            // }));
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
