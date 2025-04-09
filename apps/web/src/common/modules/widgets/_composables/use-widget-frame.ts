// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { ComputedRef, UnwrapRef } from 'vue';
import { computed, reactive } from 'vue';
import type { Location } from 'vue-router/types/router';

import { cloneDeep } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';
import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';
import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';


import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { DATA_SOURCE_DOMAIN, DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { DisplayAnnotationValue } from '@/common/modules/widgets/_widget-fields/display-annotation/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetEmit, WidgetProps, WidgetSize,
} from '@/common/modules/widgets/types/widget-display-type';
import type { FullDataLink, WidgetFrameProps } from '@/common/modules/widgets/types/widget-frame-type';

import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import type { MetricFilter } from '@/services/asset-inventory/types/asset-analysis-type';
import { UNIFIED_COST_KEY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';



interface OverridableWidgetFrameState {
    dateRange?: DateRange | ComputedRef<DateRange>;
    errorMessage?: ComputedRef<string|undefined>;
    widgetLoading?: ComputedRef<boolean>;
    noData?: ComputedRef<boolean>;
}
type DataTableModel = PublicDataTableModel | PrivateDataTableModel;

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

        const _dataTableId = dataTable?.options?.[dataTable.operator]?.data_table_id;
        const _dataTable = dataTables.find((d) => d.data_table_id === _dataTableId);
        _results = _results.concat(...getRecursiveDataTableIds(prevValue, _dataTable, dataTables));
        return _results;
    }
    return prevValue.concat(dataTable.data_table_id);
};
const getFullDataLocation = (
    dataTable: DataTableModel,
    widgetOptions?: WidgetProps['widgetOptions'],
    dateRange?: DateRange,
    dashboardVars?: DashboardVars,
    isAdminMode: boolean,
    workspaceId?: string,
): Location|undefined => {
    const _granularity = (widgetOptions?.granularity?.value as GranularityValue)?.granularity || 'MONTHLY';
    const _groupBy: string[] = dataTable?.options?.group_by?.map((d) => d.key);
    const _costFilters = [
        ...(dataTable?.options?.filter ?? []),
        ...convertDashboardVarsToConsoleFilters(dashboardVars),
    ];
    const _assetFilters: MetricFilter = {
        ...convertConsoleFiltersToMetricFilter(dataTable?.options?.filter ?? []),
        ...dashboardVars,
    };
    const _filter = (dataTable?.source_type === DATA_SOURCE_DOMAIN.COST || dataTable?.source_type === DATA_SOURCE_DOMAIN.UNIFIED_COST) ? _costFilters : _assetFilters;

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
        return {
            name: isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME : COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
            params: {
                workspaceId: isAdminMode ? undefined : workspaceId,
                dataSourceId: _costDataSourceId ?? '',
                costQuerySetId: DYNAMIC_COST_QUERY_SET_PARAMS,
            },
            query: _query,
        };
    }
    if (dataTable?.source_type === DATA_SOURCE_DOMAIN.UNIFIED_COST) {
        return {
            name: isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME : COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
            params: {
                workspaceId: isAdminMode ? undefined : workspaceId,
                dataSourceId: UNIFIED_COST_KEY,
                costQuerySetId: DYNAMIC_COST_QUERY_SET_PARAMS,
            },
            query: _query,
        };
    }
    if (dataTable?.source_type === DATA_SOURCE_DOMAIN.ASSET) {
        const _metricId = dataTable?.options?.[DATA_SOURCE_DOMAIN.ASSET]?.metric_id;
        if (_metricId) {
            return {
                name: isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME : ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                params: {
                    workspaceId: isAdminMode ? undefined : workspaceId,
                    metricId: _metricId,
                },
                query: _query,
            };
        }
    }
    return undefined;
};
export const useWidgetFrame = (
    props: UnwrapRef<WidgetProps>,
    emit: WidgetEmit,
    overrides: OverridableWidgetFrameState = {},
) => {
    /* Query */
    const {
        dataTableList,
    } = useWidgetDataTableListQuery({
        widgetId: computed(() => props.widgetId),
    });
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();


    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
        widgetConfig: computed<WidgetConfig|undefined>(() => getWidgetConfig(props.widgetName)),
        showWidgetHeader: computed<boolean>(() => props.widgetOptions?.widgetHeader?.value?.toggleValue || false),
        title: computed(() => {
            if (_state.showWidgetHeader) return props.widgetOptions?.widgetHeader?.value?.title;
            return undefined;
        }),
        description: computed(() => {
            if (_state.showWidgetHeader) return props.widgetOptions?.widgetHeader?.value?.description;
            return undefined;
        }),
        size: computed<WidgetSize>(() => {
            if (props.size && _state.widgetConfig?.meta.sizes.includes(props.size)) return props.size;
            return _state.widgetConfig?.meta.sizes[0];
        }),
        periodText: computed<string>(() => {
            if (!overrides.dateRange) return '';
            const _dateRange = overrides.dateRange?.value as DateRange;
            if (_dateRange?.start && (_dateRange.start !== _dateRange.end)) return `${_dateRange.start} ~ ${_dateRange.end}`;
            return _dateRange.end;
        }),
        dataTable: computed<DataTableModel|undefined>(() => dataTableList.value?.find((d) => d.data_table_id === props.dataTableId)),
        unitMap: computed<Record<string, string>>(() => {
            const _result: Record<string, string> = {};
            dataTableList.value.forEach((d) => {
                Object.entries(d?.data_info ?? {}).forEach(([k, v]) => {
                    if (v?.unit) _result[k] = v.unit;
                });
            });
            return _result;
        }),
        fullDataLinkList: computed<FullDataLink[]>(() => {
            if (!_state.dataTable) return [];
            let _dataTableIds = getRecursiveDataTableIds([], _state.dataTable, dataTableList.value);
            _dataTableIds = Array.from(new Set(_dataTableIds));
            const _dataTables = dataTableList.value.filter((d) => _dataTableIds.includes(d.data_table_id));
            const _result: FullDataLink[] = [];
            _dataTables.forEach((d) => {
                const _location = getFullDataLocation(d, props.widgetOptions, overrides.dateRange?.value, props.dashboardVars, _state.isAdminMode, _state.currentWorkspaceId);
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
        annotation: computed<string|undefined>(() => {
            const _displayAnnotation = props.widgetOptions?.displayAnnotation?.value as DisplayAnnotationValue;
            if (!_displayAnnotation?.toggleValue) return undefined;
            return _displayAnnotation?.annotation;
        }),
    });
    const widgetFrameProps = computed<WidgetFrameProps>(() => ({
        widgetId: props.widgetId,
        widgetOptions: props.widgetOptions,
        widgetSizes: _state.widgetConfig?.meta.sizes,
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
        annotation: _state.annotation,
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

    return { widgetFrameProps, widgetFrameEventHandlers };
};
