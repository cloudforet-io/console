<script setup lang="ts">
import {
    computed, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';
import { useRouter } from 'vue-router/composables';
import type { Location } from 'vue-router/types/router';

import type { Series } from '@amcharts/amcharts5';
import type { XYChart } from '@amcharts/amcharts5/xy';
import dayjs from 'dayjs';
import { cloneDeep, sortBy, uniqBy } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PDataLoader } from '@cloudforet/mirinae';
import { sortArrayInObjectArray } from '@cloudforet/utils';

import { CHART_TYPE, COST_DATA_FIELD_MAP, WIDGET_SIZE } from '@/api-clients/dashboard/_constants/widget-constant';
import type { DateRange } from '@/api-clients/dashboard/_types/dashboard-type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { usageUnitFormatter } from '@/lib/helper/usage-formatter';
import {
    arrayToQueryString,
    objectToQueryString,
    primitiveToQueryString,
} from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import WidgetDataTable from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import { useWidgetColorSet } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-color-set';
import { useWidgetLifecycle } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-lifecycle';
import { useWidgetPagination } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-pagination';
import { useWidget } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import { getRefinedXYChartData } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-chart-data-helper';
import {
    getDateAxisSettings,
    getXYChartLegends,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-chart-helper';
import {
    getWidgetDataTableRowLocation,
    getWidgetLocationFilters,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-location-helper';
import {
    getRefinedDateTableData, getWidgetTableDateFields,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-table-helper';
import { getWidgetValueLabel } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-value-label-helper';
import type { Field, WidgetTableData } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-data-table-type';
import type {
    WidgetExpose, WidgetProps,
    WidgetEmit,
    CostAnalyzeResponse, Legend,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';
import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';


interface SubData { date: string; value: number }
interface Data {
    value_sum: SubData[];
    _total_value_sum: number;
    [parsedDataField: string]: any; // provider: aws or provider: azure
}
interface ChartData {
    date: string;
    [parsedDataField: string]: any; // e.g. aws: 12333 or azure: 1234
}
type Response = CostAnalyzeResponse<Data>;

const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';

const router = useRouter();
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.legends?.length ?? 0),
});

const { getProperRouteLocation } = useProperRouteLocation();
const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(widgetState.dashboardOptions?.date_range?.end).format(DATE_FORMAT);
        const range = props.size === WIDGET_SIZE.full ? 11 : 3;
        const start = dayjs.utc(end).subtract(range, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    assetWidgetLocation: undefined,
    costWidgetLocation: computed<Location|undefined>(() => {
        if (!widgetState.options.cost_data_source) return undefined;
        if (!widgetState.dataField || !widgetState.options.cost_data_type) return undefined;

        return getProperRouteLocation({
            name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
            params: {
                dataSourceId: widgetState.options.cost_data_source,
                costQuerySetId: DYNAMIC_COST_QUERY_SET_PARAMS,
            },
            query: {
                granularity: primitiveToQueryString(widgetState.granularity),
                group_by: arrayToQueryString([widgetState.dataField]),
                period: objectToQueryString(widgetState.dateRange),
                filters: arrayToQueryString(getWidgetLocationFilters(widgetState.options.filters)),
            },
        });
    }),
});

const state = reactive({
    loading: true,
    data: null as Response | null,
    chart: null as null | XYChart,
    dataType: computed<string|undefined>(() => (widgetState.options.cost_data_type)),
    chartData: computed<ChartData[]>(() => {
        if (!state.data?.results) return [];

        const chartData: ChartData[] = getRefinedXYChartData<Data, ChartData>(state.data.results, {
            dataField: widgetState.parsedDataField,
            arrayDataKey: 'value_sum',
            categoryKey: DATE_FIELD_NAME,
            valueKey: 'value',
        });
        return sortBy<ChartData>(chartData, widgetState.dateRange, DATE_FIELD_NAME);
    }),
    tableFields: computed<Field[]>(() => {
        let _textOptions: Field['textOptions'];
        if (state.dataType === 'cost') {
            _textOptions = { type: 'cost' };
        } else if (state.dataType === 'usage_quantity') {
            _textOptions = { type: 'usage', unitPath: 'usage_unit' };
        }
        const refinedFields = getWidgetTableDateFields(widgetState.granularity, widgetState.dateRange, _textOptions);
        const dataFieldLabel = Object.values(COST_DATA_FIELD_MAP).find((d) => d.name === widgetState.dataField)?.label ?? widgetState.parsedDataField;

        // set width of table fields
        const dataFieldTableFieldWidth = refinedFields.length > 4 ? '28%' : '34%';
        const otherFieldWidth = refinedFields.length > 4 ? '18%' : '22%';

        const dataFieldTableField: Field = {
            label: dataFieldLabel,
            name: widgetState.parsedDataField,
            width: dataFieldTableFieldWidth,
        };
        return [
            dataFieldTableField,
            ...refinedFields.map((field) => ({ ...field, width: otherFieldWidth })),
        ];
    }),
    tableData: computed<Data[]>(() => {
        const tableData: Data[] = sortArrayInObjectArray<Data>(
            getRefinedDateTableData(state.data?.results, widgetState.dateRange, ['value_sum']),
            DATE_FIELD_NAME,
            ['value_sum'],
        ).map((data) => {
            const value = getWidgetValueLabel(data[widgetState.parsedDataField], {
                allReferenceTypeInfo: props.allReferenceTypeInfo,
                referenceIdKey: widgetState.parsedDataField,
                dataType: state.dataType,
                usageUnit: data.usage_unit,
            });

            return {
                ...data,
                [widgetState.parsedDataField]: value,
            };
        });
        return tableData;
    }),
    legends: computed<Legend[]>(() => {
        const data = state.data?.results ?? [];
        const legends: Legend[] = getXYChartLegends(data, widgetState.parsedDataField, props.allReferenceTypeInfo)
            .map((l, i) => {
                let label = l.label;
                if (state.dataType === 'usage_quantity') label = `${label}${data[i]?.usage_unit ? ` (${data[i]?.usage_unit})` : ''}`;
                return { ...l, label };
            });
        return legends;
    }),
    showLegendsOnTable: computed(() => widgetState.options.legend_options?.enabled && widgetState.options.legend_options.show_at === 'table'),
    showChart: computed(() => {
        if (state.dataType !== 'usage_quantity') return true;
        if (!state.data?.results) return true;
        // hide chart when there are different usage_unit in data or usage_unit is null
        if (state.data.results[0]?.value_sum.map((d) => d.usage_unit).some((d) => d === null)) return false;
        return uniqBy(state.data.results, 'usage_unit').length === 1;
    }),
    usageUnit: computed(() => state.data?.results?.[0]?.usage_unit),
    disableReferenceColor: computed<boolean>(() => !!props.theme),
});

const { pageSize, thisPage } = useWidgetPagination(widgetState);

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher<object, Response>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<Response|null> => {
    try {
        if (!state.dataType) {
            throw new Error('data type is not defined');
        }

        apiQueryHelper.setFilters(widgetState.consoleFilters);
        if (pageSize.value) apiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);

        const dataField = [widgetState.dataField, 'date'];
        if (state.dataType === 'usage_quantity') {
            dataField.push('usage_unit');
        }

        const { status, response } = await fetchCostAnalyze({
            data_source_id: widgetState.options.cost_data_source,
            query: {
                granularity: widgetState.granularity,
                group_by: dataField,
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                fields: {
                    value_sum: {
                        key: state.dataType,
                        operator: 'sum',
                    },
                },
                sort: [{ key: '_total_value_sum', desc: true }],
                field_group: ['date'],
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            return {
                results: response.results,
                more: response.more,
            };
        }
        return state.data;
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [], more: false };
    }
};

/* Util */
const drawChart = (chartData: ChartData[]) => {
    const isLineChart = widgetState.chartType === CHART_TYPE.LINE;
    const { chart, xAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(widgetState.dateRange));

    // set base interval of xAxis
    xAxis.get('baseInterval').timeUnit = 'month';

    // set chart colors
    chartHelper.setChartColors(chart, colorSet.value);

    // hide zoom button
    chart.zoomOutButton.set('forceHidden', true);

    // set cursor if line chart
    if (isLineChart) {
        chart.get('cursor')?.lineX.setAll({
            visible: true,
        });
    }

    // set series
    state.legends.forEach((legend) => {
        const seriesSettings = {
            name: legend.label as string,
            valueYField: legend.name,
        };

        // create series
        const series = isLineChart
            ? chartHelper.createXYLineSeries(chart, seriesSettings)
            : chartHelper.createXYColumnSeries(chart, { ...seriesSettings, stacked: true });
        chart.series.push(series);

        // set data processor on series
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat: DATE_FORMAT,
            dateFields: [DATE_FIELD_NAME],
        });

        // create tooltip and set on series
        const tooltip = chartHelper.createTooltip();
        let valueFormatter: ((value: any) => string)|undefined;
        if (state.dataType === 'usage_quantity') {
            valueFormatter = (value) => usageUnitFormatter(value, { unit: state.usageUnit }) ?? '';
        } else if (state.dataType === 'cost') {
            valueFormatter = (value) => currencyMoneyFormatter(value, { currency: widgetState.currency }) ?? '';
        }
        chartHelper.setXYSharedTooltipText(
            chart,
            tooltip,
            valueFormatter,
        );
        (series as Series).set('tooltip', tooltip);

        // set data on series
        series.data.setAll(cloneDeep(chartData));

        state.chart = chart;
    });

    // set chart legends if enabled
    if (widgetState.options.legend_options?.enabled && widgetState.options.legend_options.show_at === 'chart') {
        const chartLegends = chartHelper.createLegend({
            nameField: 'name',
        });
        chart.children.push(chartLegends);
        chartLegends.data.setAll(chart.series.values);
    }
    state.chart = chart;
};

const initWidget = async (data?: Response): Promise<Response> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (_thisPage = 1): Promise<Response> => {
    await nextTick();
    state.loading = true;
    thisPage.value = _thisPage;
    state.data = await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

/* Event */
const handleToggleLegend = (index: number) => {
    chartHelper.toggleSeries(state.chart, index);
};
const handleUpdateThisPage = (_thisPage: number) => {
    thisPage.value = _thisPage;
    state.data = undefined; // to disable next page button before fetching data
    refreshWidget(_thisPage);
};
const handleClickRow = (rowData: WidgetTableData) => {
    if (!widgetState.dataField) return;
    const _rowLocation = getWidgetDataTableRowLocation(rowData, widgetState.widgetLocation, [widgetState.dataField]);
    if (_rowLocation) window.open(router.resolve(_rowLocation).href, '_blank');
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    initWidget,
    refreshWidget,
    props,
    emit,
    widgetState,
    onCurrencyUpdate: async () => {
        if (!state.data) return;
        chartHelper.refreshRoot();
        await nextTick();
        if (chartHelper.root.value) drawChart(state.chartData);
    },
});

defineExpose<WidgetExpose<Response>>({
    initWidget,
    refreshWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  refresh-on-resize
                  class="base-trend-widget"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="data-container">
            <div v-if="state.showChart"
                 class="chart-wrapper"
            >
                <p-data-loader class="chart-loader"
                               :loading="props.loading || state.loading"
                               :data="state.chartData"
                               loader-type="skeleton"
                               disable-empty-case
                               :loader-backdrop-opacity="1"
                               show-data-from-scratch
                >
                    <div ref="chartContext"
                         class="chart"
                    />
                </p-data-loader>
            </div>
            <widget-data-table :loading="props.loading || state.loading"
                               :fields="state.tableFields"
                               :items="state.tableData"
                               :currency="widgetState.currency"
                               :all-reference-type-info="props.allReferenceTypeInfo"
                               :this-page="thisPage"
                               :show-next-page="state.data ? state.data.more : false"
                               :legends="state.legends"
                               :color-set="colorSet"
                               :show-legend="state.showLegendsOnTable"
                               @toggle-legend="handleToggleLegend"
                               @update:thisPage="handleUpdateThisPage"
                               @click-row="handleClickRow"
            />
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.base-trend-widget {
    .data-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        .chart-wrapper {
            height: 185px;
            margin-bottom: 1rem;
            .chart-loader {
                height: 100%;
                .chart {
                    height: 100%;
                }
            }
        }
        .widget-data-table {
            flex-grow: 1;
        }
    }
    &.full {
        .data-container {
            min-height: 21rem;
        }
        .widget-data-table {
            height: auto;
        }
    }
}
</style>
