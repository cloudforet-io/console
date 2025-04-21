// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { cloneDeep, flattenDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { DashboardLayout } from '@/api-clients/dashboard/_types/dashboard-type';
import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PrivateWidgetModel } from '@/api-clients/dashboard/private-widget/schema/model';
import type { DataTableListParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/list';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';
import type { PublicWidgetModel } from '@/api-clients/dashboard/public-widget/schema/model';

import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';

import type {
    SharedDashboardLayout, SharedDataTableInfo, SharedWidgetInfo,
} from '@/services/dashboards/types/shared-dashboard-type';


type DataTableModel = PublicDataTableModel | PrivateDataTableModel;
type WidgetModel = PublicWidgetModel | PrivateWidgetModel;

const _fetchWidgetDataTables = async (widgetId: string, costDataSource: CostDataSourceReferenceMap): Promise<[string, DataTableModel[]]|undefined> => {
    if (!widgetId) return undefined;
    const isPrivate = widgetId.startsWith('private');
    const fetcher = isPrivate
        ? SpaceConnector.clientV2.dashboard.privateDataTable.list<DataTableListParameters, ListResponse<DataTableModel>>
        : SpaceConnector.clientV2.dashboard.publicDataTable.list<DataTableListParameters, ListResponse<DataTableModel>>;
    try {
        const { results } = await fetcher({ widget_id: widgetId });
        if (!results) return undefined;
        const refinedResults = cloneDeep(results);
        results.forEach((r, idx) => {
            if (r.data_type === DATA_TABLE_TYPE.ADDED && r.source_type === 'COST') {
                const dataSourceId = r.options.COST?.data_source_id || '';
                refinedResults[idx].options.COST.plugin_id = costDataSource[dataSourceId]?.data?.plugin_info?.plugin_id;
                refinedResults[idx].options.COST.data_source_id = undefined;
            }
        });
        return [widgetId, refinedResults || []];
    } catch (e) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};

const _getWidgetDataTablesMap = async (dashboardLayouts: DashboardLayout[], costDataSource: CostDataSourceReferenceMap): Promise<Record<string, DataTableModel[]>> => {
    const dashboardWidgetIdList = flattenDeep(dashboardLayouts?.map((layout) => layout.widgets) || []);
    const results = await Promise.allSettled(dashboardWidgetIdList.map((widgetId) => _fetchWidgetDataTables(widgetId, costDataSource)));
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
            const operatorOptions = dt.options[dt.operator];
            if (dt.operator === 'JOIN' || dt.operator === 'CONCAT') {
                const dataTableIds = operatorOptions?.data_tables;
                const dataTableIndices = dataTableIds?.map((dtId) => dataTables.findIndex((d) => d.data_table_id === dtId));
                sharedDataTable.options = { [dt.operator]: { ...operatorOptions, data_tables: dataTableIndices } };
            } else {
                const operatorDataTableId = operatorOptions?.data_table_id;
                const dataTableIdx = dataTables.findIndex((d) => d.data_table_id === operatorDataTableId);
                sharedDataTable.options = { [dt.operator]: { ...operatorOptions, data_table_id: dataTableIdx } };
            }
        }
        return sharedDataTable;
    });
    return [sharedDataTables, dataTableIndex];
};

export const getSharedDashboardLayouts = async (
    dashboardLayouts: DashboardLayout[],
    dashboardWidgets: WidgetModel[],
    costDataSource: CostDataSourceReferenceMap,
): Promise<SharedDashboardLayout[]> => {
    const widgetDataTablesMap = await _getWidgetDataTablesMap(dashboardLayouts, costDataSource);
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
