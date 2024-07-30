import type { ComputedRef, UnwrapRef } from 'vue';
import { computed, onMounted, reactive } from 'vue';
import type { Location } from 'vue-router/types/router';

import { cloneDeep } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { DashboardVars } from '@/schema/dashboard/_types/dashboard-type';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { DataTableListParameters } from '@/schema/dashboard/public-data-table/api-verbs/list';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { DATA_SOURCE_DOMAIN, DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetFrameEmit, WidgetProps, WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';
import type { FullDataLink, WidgetFrameProps } from '@/common/modules/widgets/types/widget-frame-type';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import type { MetricFilter } from '@/services/asset-inventory/types/asset-analysis-type';
import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';


interface OverridableWidgetFrameState {
    dateRange?: DateRange | ComputedRef<DateRange>;
    errorMessage?: string | ComputedRef<string>;
    widgetLoading?: boolean | ComputedRef<boolean>;
    noData?: boolean | ComputedRef<boolean>;
    showPeriodText?: boolean;
}
type DataTableModel = PublicDataTableModel | PrivateDataTableModel;
const { getProperRouteLocation } = useProperRouteLocation();

const listDataTables = async (widgetId?: string): Promise<DataTableModel[]> => {
    if (!widgetId) return [];
    const _isPrivate = widgetId.startsWith('private');
    const _fetcher = _isPrivate
        ? SpaceConnector.clientV2.dashboard.privateDataTable.list<DataTableListParameters, ListResponse<DataTableModel>>
        : SpaceConnector.clientV2.dashboard.publicDataTable.list<DataTableListParameters, ListResponse<DataTableModel>>;
    try {
        const { results } = await _fetcher({
            widget_id: widgetId,
        });
        return results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};
const convertDashboardVarsToConsoleFilters = (dashboardVars?: DashboardVars): ConsoleFilter[] => {
    if (!dashboardVars) return [];
    return Object.entries(dashboardVars).map(([k, v]) => ({
        k,
        v,
        o: '',
    }));
};
const convertConsoleFiltersToMetricFilter = (filters?: ConsoleFilter[]): MetricFilter => {
    if (!filters) return {};
    const _result: MetricFilter = {};
    filters.forEach((d) => {
        _result[d.k] = d.v;
    });
    return _result;
};
const getRecursiveDataTableIds = (prevValue: string[] = [], dataTable: DataTableModel, dataTables: DataTableModel[]): string[] => {
    let _results: string[] = [];
    if (dataTable.data_type === DATA_TABLE_TYPE.TRANSFORMED) {
        if (dataTable.operator === 'JOIN' || dataTable.operator === 'CONCAT') {
            const _dataTableIds = dataTable?.options?.[dataTable.operator]?.data_tables ?? [];
            const _dataTables = dataTables.filter((d) => _dataTableIds.includes(d.data_table_id));
            _results = _results.concat(..._dataTables.map((d) => getRecursiveDataTableIds(prevValue, d, dataTables)));
            return _results;
        }
        return prevValue.concat(dataTable.data_table_id);
    }
    return prevValue.concat(dataTable.data_table_id);
};
const getFullDataLocation = (dataTable: DataTableModel, widgetOptions?: Record<WidgetFieldName, WidgetFieldValues>, dateRange?: DateRange, dashboardVars?: DashboardVars): Location|undefined => {
    const _granularity = (widgetOptions?.granularity as string) || 'MONTHLY';
    const _groupBy: string[] = dataTable?.options?.group_by?.map((d) => d.key);
    const _costFilters = [
        ...(dataTable?.options?.filter ?? []),
        ...convertDashboardVarsToConsoleFilters(dashboardVars),
    ];
    const _assetFilters: MetricFilter = {
        ...convertConsoleFiltersToMetricFilter(dataTable?.options?.filter ?? []),
        ...dashboardVars,
    };
    const _filter = dataTable?.source_type === DATA_SOURCE_DOMAIN.COST ? _costFilters : _assetFilters;

    const _dateRange: DateRange = cloneDeep(dateRange);
    if (!_dateRange?.start) _dateRange.start = dateRange?.end;
    const _query = {
        granularity: primitiveToQueryString(_granularity),
        group_by: arrayToQueryString(_groupBy),
        period: objectToQueryString(_dateRange),
        filters: arrayToQueryString(_filter),
    };
    if (dataTable?.source_type === DATA_SOURCE_DOMAIN.COST) {
        const _costDataSourceId = dataTable?.options?.[DATA_SOURCE_DOMAIN.COST]?.data_source_id;
        return getProperRouteLocation({
            name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
            params: {
                dataSourceId: _costDataSourceId ?? '',
                costQuerySetId: DYNAMIC_COST_QUERY_SET_PARAMS,
            },
            query: _query,
        });
    } if (dataTable?.source_type === DATA_SOURCE_DOMAIN.ASSET) {
        const _metricId = dataTable?.options?.[DATA_SOURCE_DOMAIN.ASSET]?.metric_id;
        if (_metricId) {
            return getProperRouteLocation({
                name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                params: {
                    metricId: _metricId,
                },
                query: _query,
            });
        }
    }
    return undefined;
};
export const useWidgetFrame = (
    props: UnwrapRef<WidgetProps>,
    emit: WidgetFrameEmit,
    overrides: OverridableWidgetFrameState = {},
) => {
    const _state = reactive({
        widgetConfig: computed(() => getWidgetConfig(props.widgetName)),
        title: computed(() => props.widgetOptions?.widgetHeader?.title),
        description: computed(() => props.widgetOptions?.widgetHeader?.description),
        size: computed<WidgetSize>(() => {
            if (props.size && _state.widgetConfig.meta.sizes.includes(props.size)) return props.size;
            return _state.widgetConfig.meta.sizes[0];
        }),
        periodText: computed<string>(() => {
            if (!overrides.dateRange) return '';
            const _dateRange = overrides.dateRange?.value as DateRange;
            if (_dateRange?.start && (_dateRange.start !== _dateRange.end)) return `${_dateRange.start} ~ ${_dateRange.end}`;
            return _dateRange.end;
        }),
        dataTable: computed<DataTableModel|undefined>(() => _state.dataTables?.find((d) => d.data_table_id === props.dataTableId)),
        dataTables: [] as DataTableModel[],
        unitMap: computed<Record<string, string>>(() => {
            const _result: Record<string, string> = {};
            _state.dataTables.forEach((d) => {
                Object.entries(d.data_info).forEach(([k, v]) => {
                    if (v?.unit) _result[k] = v.unit;
                });
            });
            return _result;
        }),
        fullDataLinkList: computed<FullDataLink[]>(() => {
            if (!_state.dataTable) return [];
            let _dataTableIds = getRecursiveDataTableIds([], _state.dataTable, _state.dataTables);
            _dataTableIds = Array.from(new Set(_dataTableIds));
            const _dataTables = _state.dataTables.filter((d) => _dataTableIds.includes(d.data_table_id));
            const _result: FullDataLink[] = [];
            _dataTables.forEach((d) => {
                const _location = getFullDataLocation(d, props.widgetOptions, overrides.dateRange?.value, props.dashboardVars);
                if (_location) {
                    _result.push({
                        name: d.options?.data_name,
                        location: _location,
                    });
                }
            });
            return _result;
        }),
        noData: computed(() => {
            if (props.loading || overrides.widgetLoading?.value) return false;
            return overrides.noData?.value || false;
        }),
    });
    const widgetFrameProps = computed<WidgetFrameProps>(() => ({
        widgetId: props.widgetId,
        widgetSizes: _state.widgetConfig.meta.sizes,
        dataTableId: props.dataTableId,
        //
        mode: props.mode ?? 'view',
        loading: props.loading || !!overrides.widgetLoading?.value,
        errorMessage: overrides.errorMessage?.value,
        noData: _state.noData,
        widgetState: props.widgetState,
        disableManageButtons: props.disableManageButtons,
        //
        title: _state.title,
        description: _state.description,
        size: _state.size,
        width: props.width,
        periodText: _state.periodText,
        unitMap: _state.unitMap,
        fullDataLinkList: _state.fullDataLinkList,
        showPeriodText: overrides.showPeriodText ?? false,
    }));

    const widgetFrameEventHandlers = {
        'click-expand': () => {
            emit('click-expand');
        },
        'click-edit': () => {
            emit('click-edit');
        },
        'click-clone': () => {
            emit('click-clone');
        },
        'click-delete': () => {
            emit('click-delete');
        },
        'toggle-size': (size: WidgetSize) => {
            emit('toggle-size', size);
        },
    };

    onMounted(async () => {
        _state.dataTables = await listDataTables(props.widgetId);
    });

    return { widgetFrameProps, widgetFrameEventHandlers };
};
