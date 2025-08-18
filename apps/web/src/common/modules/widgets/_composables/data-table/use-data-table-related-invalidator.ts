import type { ComputedRef } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';

interface UseDataTableRelatedLoadInvalidatorOptions {
    widgetId: ComputedRef<string|undefined>;
}

export const useDataTableRelatedLoadQueryInvalidator = ({ widgetId }: UseDataTableRelatedLoadInvalidatorOptions) => {
    const queryClient = useQueryClient();

    const { withSuffix: privateDataTableLoadQueryKey } = useServiceQueryKey('dashboard', 'private-data-table', 'load');
    const { withSuffix: publicDataTableLoadQueryKey } = useServiceQueryKey('dashboard', 'public-data-table', 'load');
    const { withSuffix: privateWidgetLoadQueryKey } = useServiceQueryKey('dashboard', 'private-widget', 'load');
    const { withSuffix: publicWidgetLoadQueryKey } = useServiceQueryKey('dashboard', 'public-widget', 'load');
    const { withSuffix: privateWidgetLoadSumQueryKey } = useServiceQueryKey('dashboard', 'private-widget', 'load-sum');
    const { withSuffix: publicWidgetLoadSumQueryKey } = useServiceQueryKey('dashboard', 'public-widget', 'load-sum');

    const invalidateLoadQueries = async (data: DataTableModel) => {
        if (!widgetId.value) return;
        if (data.data_table_id.startsWith('private')) {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: privateDataTableLoadQueryKey(data.data_table_id) }),
                queryClient.invalidateQueries({ queryKey: privateWidgetLoadQueryKey(widgetId.value) }),
                queryClient.invalidateQueries({ queryKey: privateWidgetLoadSumQueryKey(widgetId.value) }),
            ]);
        } else {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: publicDataTableLoadQueryKey(data.data_table_id) }),
                queryClient.invalidateQueries({ queryKey: publicWidgetLoadQueryKey(widgetId.value) }),
                queryClient.invalidateQueries({ queryKey: publicWidgetLoadSumQueryKey(widgetId.value) }),
            ]);
        }
    };

    return {
        invalidateLoadQueries,
    };
};
