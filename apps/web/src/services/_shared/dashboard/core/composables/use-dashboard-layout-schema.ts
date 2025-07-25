import { cloneDeep, flattenDeep } from 'lodash';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostDataSourceModel } from '@/api-clients/cost-analysis/data-source/schema/model';
import type { DashboardLayout } from '@/api-clients/dashboard/_types/dashboard-type';
import type { WidgetModel } from '@/api-clients/dashboard/_types/widget-type';
import type { DataTableListParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/list';


import ErrorHandler from '@/common/composables/error/errorHandler';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    ConcatOptions, CostOptions, DataTableTransformOptions, JoinOptions,
} from '@/common/modules/widgets/types/widget-model';

import { useCostDataSourceMap } from '@/services/_shared/dashboard/core/composables/use-cost-data-source-map';
import { useDataTableListQueryFetcher } from '@/services/_shared/dashboard/core/composables/use-data-table-list-query-fetcher';
import type { SharedDashboardLayout, SharedDataTableInfo, SharedWidgetInfo } from '@/services/dashboards/types/shared-dashboard-type';




export const useDashboardLayoutSchema = () => {
    const { fetchDataTableList } = useDataTableListQueryFetcher();
    const { getCostDataSourceMap } = useCostDataSourceMap();

    const getSharedDashboardLayouts = async (
        dashboardLayouts: DashboardLayout[],
        dashboardWidgets: WidgetModel[],
    ): Promise<SharedDashboardLayout[]> => {
        const costDataSourceMap = await getCostDataSourceMap();
        const widgetDataTablesMap = await _getWidgetDataTablesMap(
            dashboardLayouts,
            fetchDataTableList,
            costDataSourceMap,
        );
        return dashboardLayouts?.map((layout) => {
            const sharedWidgets = layout.widgets?.map((widgetId) => {
                const widget = dashboardWidgets.find((w) => w.widget_id === widgetId);
                if (widget) {
                    const [dataTables, dataTableIndex] = _getSharedDataTableInfoList(widgetDataTablesMap, widget.widget_id, widget.data_table_id);
                    return {
                        widget_type: widget.widget_type,
                        size: widget.size,
                        options: widget.options,
                        data_tables: dataTables,
                        data_table_id: dataTableIndex > -1 ? dataTableIndex : 0,
                    };
                }
                return null;
            }).filter(Boolean) as SharedWidgetInfo[];
            return { widgets: sharedWidgets };
        });
    };


    return {
        getSharedDashboardLayouts,
    };
};

const _fetchWidgetDataTables = async (
    widgetId: string,
    fetchDataTableList: (params: DataTableListParameters) => Promise<ListResponse<DataTableModel>>,
    costDataSourceMap: Record<string, CostDataSourceModel>,
): Promise<[string, DataTableModel[]]|undefined> => {
    if (!widgetId) return undefined;
    try {
        const { results } = await fetchDataTableList({ widget_id: widgetId });
        if (!results) return undefined;
        const refinedResults = cloneDeep(results);
        results.forEach((r, idx) => {
            if (r.data_type === DATA_TABLE_TYPE.ADDED && r.source_type === 'COST') {
                const dataSourceId = r.options.COST?.data_source_id || '';
                if (dataSourceId && refinedResults[idx].options.COST !== undefined) {
                    (refinedResults[idx].options.COST as CostOptions).plugin_id = costDataSourceMap[dataSourceId]?.plugin_info?.plugin_id;
                    (refinedResults[idx].options.COST as CostOptions).data_source_id = undefined;
                }
            }
        });
        return [widgetId, refinedResults || []];
    } catch (e) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};

const _getWidgetDataTablesMap = async (
    dashboardLayouts: DashboardLayout[],
    dataTableListFetcher: (params: DataTableListParameters) => Promise<ListResponse<DataTableModel>>,
    costDataSourceMap: Record<string, CostDataSourceModel>,
): Promise<Record<string, DataTableModel[]>> => {
    const dashboardWidgetIdList = flattenDeep(dashboardLayouts?.map((layout) => layout.widgets || []) || []);
    const results = await Promise.allSettled(dashboardWidgetIdList.map((widgetId) => _fetchWidgetDataTables(widgetId as string, dataTableListFetcher, costDataSourceMap)));
    return results.reduce((acc, r) => {
        if (r.status === 'fulfilled' && r.value) {
            const [widgetId, dataTables] = r.value;
            if (widgetId && dataTables) {
                acc[widgetId] = dataTables;
            }
        }
        return acc;
    }, {} as Record<string, DataTableModel[]>);
};

const _getSharedDataTableInfoList = (widgetDataTablesMap: Record<string, DataTableModel[]>, widgetId: string, dataTableId?: string): [SharedDataTableInfo[], number] => {
    const dataTables = widgetDataTablesMap[widgetId] || [];
    const dataTableIndex = dataTables.findIndex((d) => d.data_table_id === dataTableId);
    const sharedDataTables = dataTables.map((dt) => {
        const sharedDataTable: SharedDataTableInfo = {
            name: dt.name,
            data_type: dt.data_type,
            source_type: dt.source_type,
            operator: dt.operator,
            options: dt.options,
        };
        if (dt.data_type === DATA_TABLE_TYPE.TRANSFORMED) {
            const operatorOptions = (dt.options as DataTableTransformOptions)[dt.operator as keyof DataTableTransformOptions];
            if (dt.operator === 'JOIN' || dt.operator === 'CONCAT') {
                const dataTableIds = (operatorOptions as JoinOptions | ConcatOptions)?.data_tables;
                const dataTableIndices = dataTableIds?.map((dtId) => dataTables.findIndex((d) => d.data_table_id === dtId));
                (sharedDataTable.options as DataTableTransformOptions)[dt.operator] = { ...operatorOptions, data_tables: dataTableIndices };
            } else {
                const operatorDataTableId = (operatorOptions as Omit<DataTableTransformOptions, 'JOIN'|'CONCAT'>)?.data_table_id;
                const dataTableIdx = dataTables.findIndex((d) => d.data_table_id === operatorDataTableId);
                (sharedDataTable.options as DataTableTransformOptions) = { [dt.operator as string]: { ...operatorOptions, data_table_id: dataTableIdx } };
            }
        }
        return sharedDataTable;
    });
    return [sharedDataTables, dataTableIndex];
};
