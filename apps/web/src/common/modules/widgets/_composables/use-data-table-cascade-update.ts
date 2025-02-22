import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';

import { useWidgetFormQuery } from '@/common/modules/widgets/_composables/use-widget-form-query';
import { createDataTableReferenceMap } from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import type { DataTableModel, DataTableReference } from '@/common/modules/widgets/types/widget-data-table-type';


interface UseDataTableCascadeUpdateOptions {
    widgetId: ComputedRef<string|undefined>;
}

interface UseDataTableCascadeUpdateReturn {
    cascadeUpdateDataTable: (dataTableId: string) => Promise<void>;
}

export const useDataTableCascadeUpdate = ({ widgetId }: UseDataTableCascadeUpdateOptions): UseDataTableCascadeUpdateReturn => {
    /* Query */
    const {
        dataTableList,
        fetcher,
        keys,
        queryClient,
    } = useWidgetFormQuery({
        widgetId: computed(() => widgetId.value),
    });

    const _state = reactive({
        isPrivate: computed(() => !!widgetId.value?.startsWith('private')),
        dataTableReferenceMap: computed<Record<string, DataTableReference>>(() => createDataTableReferenceMap(dataTableList.value)),
    });

    const _invalidateLoadQueries = async (data: DataTableModel) => {
        await queryClient.invalidateQueries({
            queryKey: [
                ...(_state.isPrivate ? keys.privateDataTableLoadQueryKey.value : keys.publicDataTableLoadQueryKey.value),
                data.data_table_id,
            ],
        });
    };

    const cascadeUpdateDataTable = async (dataTableId: string) => {
        const children = _state.dataTableReferenceMap[dataTableId].children;
        return children.reduce((chain, childId) => chain.then(async () => {
            const currentDataTable = dataTableList.value.find(
                (_dataTable) => _dataTable.data_table_id === childId,
            ) as DataTableModel;

            const result = await fetcher.updateDataTableFn({
                data_table_id: childId,
                name: currentDataTable?.name,
                options: {
                    ...(currentDataTable?.options ?? {}),
                },
            });
            const dataTableListQueryKey = _state.isPrivate ? keys.privateDataTableListQueryKey : keys.publicDataTableListQueryKey;
            await queryClient.setQueryData(dataTableListQueryKey.value, (oldData: ListResponse<DataTableModel>) => {
                if (oldData.results) {
                    return {
                        ...oldData,
                        results: oldData.results.map((item) => (item.data_table_id === result.data_table_id ? result : item)),
                    };
                }
                return oldData;
            });
            await _invalidateLoadQueries(result);

            return cascadeUpdateDataTable(childId);
        }), Promise.resolve());
    };

    return {
        cascadeUpdateDataTable,
    };
};
