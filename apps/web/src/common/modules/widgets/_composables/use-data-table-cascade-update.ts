import type { ComputedRef } from 'vue';
import {
    computed, reactive,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { createDataTableReferenceMap } from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableModel, DataTableReference } from '@/common/modules/widgets/types/widget-data-table-type';




interface UseDataTableCascadeUpdateOptions {
    widgetId: ComputedRef<string|undefined>;
}

interface UseDataTableCascadeUpdateReturn {
    cascadeUpdateDataTable: (dataTableId: string) => Promise<void>;
}

export const useDataTableCascadeUpdate = ({ widgetId }: UseDataTableCascadeUpdateOptions): UseDataTableCascadeUpdateReturn => {
    const widgetGenerateStore = useWidgetGenerateStore();
    const widgetGenerateState = widgetGenerateStore.state;

    /* Query */
    const {
        keys,
        fetcher,
        dataTableList,
    } = useWidgetDataTableListQuery({
        widgetId: computed(() => widgetId.value),
    });
    const queryClient = useQueryClient();

    const _state = reactive({
        isPrivate: computed(() => !!widgetId.value?.startsWith('private')),
        dataTableReferenceMap: computed<Record<string, DataTableReference>>(() => createDataTableReferenceMap(dataTableList.value)),
    });

    const { withSuffix: privateDataTableLoadWithSuffix } = useServiceQueryKey('dashboard', 'private-data-table', 'load');
    const { withSuffix: publicDataTableLoadWithSuffix } = useServiceQueryKey('dashboard', 'public-data-table', 'load');
    const { withSuffix: privateDataTableGetQueryKey } = useServiceQueryKey('dashboard', 'private-data-table', 'get');
    const { withSuffix: publicDataTableGetQueryKey } = useServiceQueryKey('dashboard', 'public-data-table', 'get');

    const _invalidateLoadQueries = async (data: DataTableModel) => {
        await queryClient.invalidateQueries({
            queryKey: _state.isPrivate ? privateDataTableLoadWithSuffix(data.data_table_id) : publicDataTableLoadWithSuffix(data.data_table_id),
        });
    };

    const cascadeUpdateDataTable = async (dataTableId: string) => {
        const children = _state.dataTableReferenceMap[dataTableId]?.children;
        return children?.reduce((chain, childId) => chain.then(async () => {
            try {
                widgetGenerateStore.setDataTableCasCadeUpdateLoadingMap({
                    ...widgetGenerateState.dataTableCasCadeUpdateLoadingMap,
                    [childId]: true,
                });

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

                const dataTableListQueryKey = _state.isPrivate
                    ? keys.privateDataTableListQueryKey
                    : keys.publicDataTableListQueryKey;

                await queryClient.setQueryData(dataTableListQueryKey.value, (oldData: ListResponse<DataTableModel>) => {
                    if (oldData?.results) {
                        return {
                            ...oldData,
                            results: oldData.results.map((item) => (item.data_table_id === result.data_table_id ? result : item)),
                        };
                    }
                    return oldData;
                });
                await queryClient.invalidateQueries({ queryKey: _state.isPrivate ? privateDataTableGetQueryKey(result.data_table_id) : publicDataTableGetQueryKey(result.data_table_id) });

                await _invalidateLoadQueries(result);
                await cascadeUpdateDataTable(childId);
            } catch (error) {
                ErrorHandler.handleError(error);
            } finally {
                setTimeout(() => {
                    widgetGenerateStore.setDataTableCasCadeUpdateLoadingMap({
                        ...widgetGenerateState.dataTableCasCadeUpdateLoadingMap,
                        [childId]: false,
                    });
                }, 500);
            }
        }), Promise.resolve());
    };

    return {
        cascadeUpdateDataTable,
    };
};
