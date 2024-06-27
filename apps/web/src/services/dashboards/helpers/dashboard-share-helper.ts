import { flattenDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { DashboardLayout } from '@/schema/dashboard/_types/dashboard-type';
import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { DataTableListParameters } from '@/schema/dashboard/public-data-table/api-verbs/list';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';


type DashboardModel = PublicDashboardModel | PrivateDashboardModel;
type DataTableModel = PublicDataTableModel | PrivateDataTableModel;
type WidgetModel = PublicWidgetModel | PrivateWidgetModel;
type SharedDataTableInfo = Pick<DataTableModel, 'name' | 'data_type' | 'source_type' | 'operator' | 'options' | 'labels_info' | 'data_info'>;
type SharedWidgetInfo =
    Pick<WidgetModel, 'name' | 'description' | 'size' | 'widget_type' | 'options'> & {
    data_tables: SharedDataTableInfo[];
    data_table_id: number;
};
type SharedDashboardLayout = {
    name?: string;
    widgets: SharedWidgetInfo[];
};
type SharedDashboardInfo =
    Pick<DashboardModel, 'name' | 'version' | 'options' | 'labels'> & {
    layouts: Array<{
        name?: string;
        widgets: SharedWidgetInfo[];
    }>;
};


const _listWidgetDataTables = async (widgetId?: string): Promise<[string, DataTableModel[]]|undefined> => {
    if (!widgetId) return undefined;
    const _isPrivate = widgetId.startsWith('private');
    const _fetcher = _isPrivate
        ? SpaceConnector.clientV2.dashboard.privateDataTable.list<DataTableListParameters, ListResponse<DataTableModel>>
        : SpaceConnector.clientV2.dashboard.publicDataTable.list<DataTableListParameters, ListResponse<DataTableModel>>;
    try {
        const { results } = await _fetcher({
            widget_id: widgetId,
        });
        if (!results) return undefined;
        return [widgetId, results || []];
    } catch (e) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};
const _getWidgetDataTablesMap = async (dashboardLayouts: DashboardLayout[]): Promise<Record<string, DataTableModel[]>> => {
    const _dashboardWidgetIdList = flattenDeep(dashboardLayouts?.map((layout) => layout.widgets?.map((w) => w)) || []);
    const results = await Promise.allSettled(_dashboardWidgetIdList.map((widgetId) => _listWidgetDataTables(widgetId)));
    const _widgetDataTablesMap: Record<string, DataTableModel[]> = {};
    results.forEach((r) => {
        if (r.status === 'fulfilled') {
            if (!r.value) return;
            const [widgetId, dataTables] = r.value;
            if (widgetId && dataTables) {
                _widgetDataTablesMap[widgetId] = dataTables;
            }
        }
    });
    return _widgetDataTablesMap;
};

const _getSharedDataTableInfoList = (widgetDataTablesMap: Record<string, DataTableModel[]>, widgetId: string, dataTableId?: string): [SharedDataTableInfo[], number] => {
    const _dataTables = widgetDataTablesMap[widgetId] || [];
    const _dataTableIndex = _dataTables.findIndex((d) => d.data_table_id === dataTableId);
    const _sharedDataTables: SharedDataTableInfo[] = [];
    _dataTables.forEach((dt) => {
        const _sharedDataTable = {
            name: dt.name,
            data_type: dt.data_type,
            source_type: dt.source_type,
            operator: dt.operator,
            labels_info: dt.labels_info,
            data_info: dt.data_info,
            options: dt.options,
        };
        if (dt.data_type === DATA_TABLE_TYPE.TRANSFORMED) {
            if (dt.operator === 'JOIN' || dt.operator === 'CONCAT') {
                const _dataTableIds = dt.options[dt.operator].data_tables;
                const _dataTableIndices = _dataTableIds.map((dtId) => _dataTables.findIndex((d) => d.data_table_id === dtId));
                _sharedDataTable.options = {
                    [dt.operator]: {
                        ...dt.options[dt.operator],
                        data_tables: _dataTableIndices,
                    },
                };
            } else if (dt.operator === 'EVAL' || dt.operator === 'QUERY') {
                const _dataTableId = dt.options[dt.operator].data_table_id;
                const _dataTableIdx = _dataTables.findIndex((d) => d.data_table_id === _dataTableId);
                _sharedDataTable.options = {
                    [dt.operator]: {
                        ...dt.options[dt.operator],
                        data_table_id: _dataTableIdx,
                    },
                };
            }
        }
        _sharedDataTables.push(_sharedDataTable);
    });
    return [_sharedDataTables, _dataTableIndex];
};
export const getSharedDashboardLayouts = async (dashboardLayouts: DashboardLayout[], dashboardWidgets: WidgetModel[]): Promise<SharedDashboardLayout[]> => {
    const _widgetDataTablesMap = await _getWidgetDataTablesMap(dashboardLayouts);
    const _sharedLayouts: SharedDashboardInfo['layouts'] = [];
    dashboardLayouts.forEach((layout) => {
        const _sharedWidgets: SharedWidgetInfo[] = [];
        layout.widgets?.forEach((widgetId) => {
            const _widget = dashboardWidgets.find((w) => w.widget_id === widgetId);
            if (_widget) {
                const _dataTableId = _widget.data_table_id;
                const [_dataTables, _dataTableIndex] = _getSharedDataTableInfoList(_widgetDataTablesMap, _widget.widget_id, _dataTableId);
                const _sharedWidgetInfo: SharedWidgetInfo = {
                    name: _widget.name,
                    widget_type: _widget.widget_type,
                    size: _widget.size,
                    options: _widget.options,
                    description: _widget.description,
                    data_tables: _dataTables,
                    data_table_id: _dataTableIndex > -1 ? _dataTableIndex : 0,
                };
                _sharedWidgets.push(_sharedWidgetInfo);
            }
        });
        _sharedLayouts.push({
            widgets: _sharedWidgets,
        });
    });
    return _sharedLayouts;
};
