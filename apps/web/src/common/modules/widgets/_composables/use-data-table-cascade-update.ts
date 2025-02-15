import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';

import { useWidgetFormQuery } from '@/common/modules/widgets/_composables/use-widget-form-query';
import { DATA_TABLE_OPERATOR, DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import type { DataTableModel, DataTableReference } from '@/common/modules/widgets/types/widget-data-table-type';
import type { ConcatOptions, DataTableOperator, JoinOptions } from '@/common/modules/widgets/types/widget-model';


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
        dataTableReferenceMap: computed<Record<string, DataTableReference>>(() => {
            const referenceMap = {} as Record<string, DataTableReference>;
            const savedDataTables = dataTableList.value.filter((dataTable) => dataTable.data_table_id && !dataTable.data_table_id.startsWith('UNSAVED-')) as DataTableModel[];
            const MULTIPE_DATA_TABLE_OPERATORS = [DATA_TABLE_OPERATOR.CONCAT, DATA_TABLE_OPERATOR.JOIN] as DataTableOperator[];
            savedDataTables.forEach((dataTable) => {
                if (!referenceMap[dataTable.data_table_id]) {
                    referenceMap[dataTable.data_table_id] = _setIniitialDataTableReferenceProperty(dataTable.data_table_id);
                }

                if (dataTable.data_type === DATA_TABLE_TYPE.TRANSFORMED) {
                    if (dataTable?.operator && MULTIPE_DATA_TABLE_OPERATORS.includes(dataTable?.operator)) {
                        const [firstReferenceDataTableId, secondReferenceDataTableId] = (dataTable.options[dataTable?.operator] as ConcatOptions|JoinOptions)?.data_tables ?? [];
                        if (!referenceMap[firstReferenceDataTableId]) {
                            referenceMap[firstReferenceDataTableId] = _setIniitialDataTableReferenceProperty(firstReferenceDataTableId);
                        }
                        if (!referenceMap[secondReferenceDataTableId]) {
                            referenceMap[secondReferenceDataTableId] = _setIniitialDataTableReferenceProperty(secondReferenceDataTableId);
                        }
                        referenceMap[firstReferenceDataTableId] = {
                            ...referenceMap[firstReferenceDataTableId],
                            children: [
                                ...referenceMap[firstReferenceDataTableId].children,
                                dataTable.data_table_id,
                            ],
                        };
                        referenceMap[secondReferenceDataTableId] = {
                            ...referenceMap[secondReferenceDataTableId],
                            children: [
                                ...referenceMap[secondReferenceDataTableId].children,
                                dataTable.data_table_id,
                            ],
                        };
                        referenceMap[dataTable.data_table_id] = {
                            ...referenceMap[dataTable.data_table_id],
                            parents: [
                                firstReferenceDataTableId,
                                secondReferenceDataTableId,
                            ],
                        };
                    } else {
                        const referenceDataTableId = dataTable.options[dataTable?.operator]?.data_table_id;
                        if (!referenceMap[referenceDataTableId]) {
                            referenceMap[referenceDataTableId] = _setIniitialDataTableReferenceProperty(referenceDataTableId);
                        }
                        referenceMap[referenceDataTableId] = {
                            ...referenceMap[referenceDataTableId],
                            children: [
                                ...referenceMap[referenceDataTableId].children,
                                dataTable.data_table_id,
                            ],
                        };
                        referenceMap[dataTable.data_table_id] = {
                            ...referenceMap[dataTable.data_table_id],
                            parents: [referenceDataTableId],
                        };
                    }
                }
            });
            return referenceMap;
        }),
    });

    const _setIniitialDataTableReferenceProperty = (dataTableId: string): DataTableReference => ({
        data_table_id: dataTableId,
        parents: [],
        children: [],
    });
    const _invalidateLoadQueries = async (data: DataTableModel) => {
        await queryClient.invalidateQueries({
            queryKey: [
                ...(_state.isPrivate ? keys.privateDataTableLoadQueryKey.value : keys.publicDataTableLoadQueryKey.value),
                data.data_table_id,
            ],
        });
        /*
        * Reference cascade updating do not affect the widget load query
        * Because DataTable is Change, not Widget's selected DataTable
        *  */
        // await queryClient.invalidateQueries({
        //     queryKey: [
        //         ...(_state.isPrivate ? keys.privateWidgetLoadQueryKey.value : keys.publicWidgetLoadQueryKey.value),
        //         dashboardId.value,
        //         widgetId.value,
        //     ],
        // });
        // await queryClient.invalidateQueries({
        //     queryKey: [
        //         ...(_state.isPrivate ? keys.privateWidgetLoadSumQueryKey.value : keys.publicWidgetLoadSumQueryKey.value),
        //         dashboardId.value,
        //         widgetId.value,
        //     ],
        // });
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
