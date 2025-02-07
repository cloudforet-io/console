import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';

import { DATA_TABLE_OPERATOR, DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import type { DataTableModel, DataTableReference } from '@/common/modules/widgets/types/widget-data-table-type';
import type { ConcatOptions, JoinOptions } from '@/common/modules/widgets/types/widget-model';

import { useDashboardWidgetFormQuery } from '@/services/dashboards/composables/use-dashboard-widget-form-query';

interface UseDashboardDataTableCascadeUpdateOptions {
    widgetId: ComputedRef<string|undefined>;
}

interface UseDashboardDataTableCascadeUpdateReturn {
    cascadeUpdateDataTable: (dataTableId: string) => Promise<void>;
}

export const useDashboardDataTableCascadeUpdate = ({ widgetId }: UseDashboardDataTableCascadeUpdateOptions): UseDashboardDataTableCascadeUpdateReturn => {
    /* Query */
    const {
        dataTableList,
        fetcher,
        keys,
        queryClient,
    } = useDashboardWidgetFormQuery({
        widgetId: computed(() => widgetId.value),
    });

    const _state = reactive({
        isPrivate: computed(() => !!widgetId.value?.startsWith('private')),
        dataTableReferenceMap: computed<Record<string, DataTableReference>>(() => {
            const referenceMap = {} as Record<string, DataTableReference>;
            const savedDataTables = dataTableList.value.filter((dataTable) => dataTable.data_table_id && !dataTable.data_table_id.startsWith('UNSAVED-')) as DataTableModel[];
            const MULTIPE_DATA_TABLE_OPERATORS = [DATA_TABLE_OPERATOR.CONCAT, DATA_TABLE_OPERATOR.JOIN];
            savedDataTables.forEach((dataTable) => {
                if (!referenceMap[dataTable.data_table_id]) {
                    referenceMap[dataTable.data_table_id] = _setIniitialDataTableReferenceProperty(dataTable.data_table_id);
                }

                if (dataTable.data_type === DATA_TABLE_TYPE.TRANSFORMED) {
                    if (MULTIPE_DATA_TABLE_OPERATORS.includes(dataTable?.operator)) {
                        const [firstReferenceDataTableId, secondReferenceDataTableId] = (dataTable.options[dataTable.operator] as ConcatOptions|JoinOptions).data_tables;
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
                        const referenceDataTableId = dataTable.options[dataTable.operator].data_table_id;
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
            queryClient.setQueryData(dataTableListQueryKey.value, (oldData: ListResponse<DataTableModel>) => {
                if (oldData.results) {
                    return {
                        ...oldData,
                        results: oldData.results.map((item) => (item.data_table_id === result.data_table_id ? result : item)),
                    };
                }
                return oldData;
            });

            return cascadeUpdateDataTable(childId);
        }), Promise.resolve());
    };

    return {
        cascadeUpdateDataTable,
    };
};
