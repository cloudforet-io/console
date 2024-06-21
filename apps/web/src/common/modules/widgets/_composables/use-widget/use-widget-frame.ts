import type { ComputedRef, UnwrapRef } from 'vue';
import { computed, onMounted, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { DataTableGetParameters } from '@/schema/dashboard/public-data-table/api-verbs/get';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { DATA_SOURCE_DOMAIN, DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetFrameEmit, WidgetProps, WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFrameProps } from '@/common/modules/widgets/types/widget-frame-type';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';


interface OverridableWidgetFrameState {
    dateRange?: DateRange | ComputedRef<DateRange>;
    errorMessage?: string | ComputedRef<string>;
    widgetLoading?: boolean | ComputedRef<boolean>;
}
type DataTableModel = PublicDataTableModel | PrivateDataTableModel;

const getDataTable = async (dataTableId?: string): Promise<DataTableModel|null> => {
    if (!dataTableId) return null;
    try {
        return await SpaceConnector.clientV2.dashboard.publicDataTable.get<DataTableGetParameters, DataTableModel>({
            data_table_id: dataTableId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    }
};
export const useWidgetFrame = (
    props: UnwrapRef<WidgetProps>,
    emit: WidgetFrameEmit,
    overrides: OverridableWidgetFrameState = {},
) => {
    const _state = reactive({
        widgetConfig: computed(() => getWidgetConfig(props.widgetName)),
        title: computed(() => props.title ?? _state.widgetConfig?.meta.title ?? ''),
        size: computed<WidgetSize>(() => {
            if (props.size && _state.widgetConfig.meta.sizes.includes(props.size)) return props.size;
            return _state.widgetConfig.meta.sizes[0];
        }),
        basedOnText: computed<string>(() => {
            if (!overrides.dateRange) return '';
            const _dateRange = overrides.dateRange?.value as DateRange;
            if (_dateRange?.start) return `${_dateRange.start} ~ ${_dateRange.end}`;
            return _dateRange.end;
        }),
        dataTable: undefined as DataTableModel|undefined,
        unit: computed<string|undefined>(() => {
            if (!_state.dataTable) return undefined;
            if (_state.dataTable.data_type === DATA_TABLE_TYPE.TRANSFORMED) return undefined;
            return _state.dataTable.options?.data_unit;
        }),
        fullDataLinkText: computed<string|undefined>(() => {
            if (!_state.dataTable) return undefined;
            if (_state.dataTable.data_type === DATA_TABLE_TYPE.TRANSFORMED) return undefined;
            return _state.dataTable?.options?.data_name;
        }),
        fullDataLocation: computed<Location|undefined>(() => {
            if (!_state.dataTable) return undefined;
            if (_state.dataTable.data_type === DATA_TABLE_TYPE.TRANSFORMED) return undefined;
            if (_state.dataTable?.source_type === DATA_SOURCE_DOMAIN.COST) {
                const _costDataSourceId = _state.dataTable?.options?.[DATA_SOURCE_DOMAIN.COST]?.data_source_id;
                const _granularity = (props.widgetOptions?.granularity as string) || 'MONTHLY';
                const _period = overrides.dateRange?.value;
                const _groupBy: string[] = _state.dataTable?.options?.group_by?.map((d) => d.key);
                const _filter = _state.dataTable?.options?.filter;
                return {
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                    params: {
                        dataSourceId: _costDataSourceId ?? '',
                        costQuerySetId: DYNAMIC_COST_QUERY_SET_PARAMS,
                    },
                    query: {
                        granularity: primitiveToQueryString(_granularity),
                        group_by: arrayToQueryString(_groupBy),
                        period: objectToQueryString(_period),
                        filters: arrayToQueryString(_filter),
                    },
                };
            } if (_state.dataTable?.source_type === DATA_SOURCE_DOMAIN.ASSET) {
                const _metricId = _state.dataTable?.options?.[DATA_SOURCE_DOMAIN.ASSET]?.metric_id;
                if (_metricId) {
                    return {
                        name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                        params: {
                            metricId: _metricId,
                        },
                    };
                }
            }
            return undefined;
        }),
    });
    const widgetFrameProps = computed<WidgetFrameProps>(() => ({
        widgetId: props.widgetId,
        widgetSizes: _state.widgetConfig.meta.sizes,
        //
        mode: props.mode ?? 'view',
        loading: props.loading || overrides.widgetLoading?.value,
        errorMessage: overrides.errorMessage?.value,
        //
        title: _state.title,
        description: props.description,
        size: _state.size,
        width: props.width,
        basedOnText: _state.basedOnText,
        unit: _state.unit,
        fullDataLinkText: _state.fullDataLinkText,
        fullDataLocation: _state.fullDataLocation,
    }));

    const widgetFrameEventHandlers = {
        'click-expand': () => {
            emit('click-expand');
        },
        'click-edit': () => {
            emit('click-edit');
        },
        'click-delete': () => {
            emit('click-delete');
        },
        'toggle-size': (size: WidgetSize) => {
            emit('toggle-size', size);
        },
    };

    onMounted(async () => {
        _state.dataTable = await getDataTable(props.dataTableId);
    });

    return { widgetFrameProps, widgetFrameEventHandlers };
};
