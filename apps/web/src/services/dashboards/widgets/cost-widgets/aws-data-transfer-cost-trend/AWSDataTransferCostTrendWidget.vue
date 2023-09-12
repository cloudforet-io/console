<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import type { XYChart } from '@amcharts/amcharts4/charts';
import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep, sortBy } from 'lodash';

import { sortArrayInObjectArray } from '@cloudforet/core-lib';
import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ReferenceType } from '@/store/reference/all-reference-store';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { DateRange } from '@/services/dashboards/config';
import type { Field, WidgetTableData } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrameNew.vue';
import type {
    WidgetProps, WidgetExpose, SelectorType, WidgetEmit,
} from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import {
    getDateAxisSettings,
    getXYChartLegends,
    getRefinedXYChartData,
} from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import {
    getReferenceTypeOfGroupBy,
    getRefinedDateTableData,
    getWidgetTableDateFields,
} from '@/services/dashboards/widgets/_helpers/widget-table-helper';
import {
    useCostWidgetFrameHeaderDropdown,
} from '@/services/dashboards/widgets/_hooks/use-cost-widget-frame-header-dropdown';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
import { useWidgetPagination } from '@/services/dashboards/widgets/_hooks/use-widget-pagination';
// eslint-disable-next-line import/no-cycle
import { useWidget } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';
import type { CostAnalyzeResponse, Legend, XYChartData } from '@/services/dashboards/widgets/type';


const USAGE_TYPE_QUERY_KEY = 'additional_info.Usage Type Details';
const USAGE_TYPE_VALUE_KEY = 'Usage Type Details';
interface SubData { [USAGE_TYPE_VALUE_KEY]: string; date: string; value: number }
interface Data {
    cost_sum: SubData[];
    usage_quantity_sum: SubData[];
    _total_cost_sum: number;
    _total_usage_quantity_sum: number;
    [groupBy: string]: string | any;
}
type FullData = CostAnalyzeResponse<Data>;


const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';
const USAGE_SOURCE_UNIT = 'GB';

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(widgetState.settings?.date_range?.end).format(DATE_FORMAT);
        const range = props.size === WIDGET_SIZE.full ? 11 : 3;
        const start = dayjs.utc(end).subtract(range, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
        params: {
            // TODO: after hook refactor, add params
        },
        query: {
            granularity: primitiveToQueryString(widgetState.granularity),
            group_by: arrayToQueryString([widgetState.groupBy]),
            period: objectToQueryString(widgetState.dateRange),
            filters: objectToQueryString({ ...widgetState.options.filters, provider: ['aws'], product: ['AWSDataTransfer'] }),
        },
    })),
});

const state = reactive({
    loading: true,
    data: null as FullData | null,
    fieldsKey: computed<string>(() => (selectedSelectorType.value === 'cost' ? 'cost_sum' : 'usage_quantity_sum')),
    chartData: computed<XYChartData[]>(() => {
        if (!state.data?.results) return [];
        const dataKey = state.fieldsKey;
        const chartData = getRefinedXYChartData(state.data.results, {
            groupBy: widgetState.groupBy,
            arrayDataKey: dataKey,
            categoryKey: DATE_FIELD_NAME,
            valueKey: 'value',
            additionalIncludeKeys: [USAGE_TYPE_VALUE_KEY],
        });
        return sortBy(chartData, widgetState.dateRange, DATE_FIELD_NAME);
    }),
    tableFields: computed<Field[]>(() => {
        if (!widgetState.groupBy) return [];
        const _textOptions: Field['textOptions'] = {
            type: state.fieldsKey === 'cost_sum' ? 'cost' : 'size',
            sourceUnit: USAGE_SOURCE_UNIT,
        };

        const groupByLabel = COST_GROUP_BY_ITEM_MAP[widgetState.groupBy]?.label ?? widgetState.groupBy;
        const refinedFields = getWidgetTableDateFields(widgetState.granularity, widgetState.dateRange, _textOptions, state.fieldsKey);
        const referenceType = getReferenceTypeOfGroupBy(props.allReferenceTypeInfo, widgetState.groupBy) as ReferenceType;

        // set width of table fields
        const groupByFieldWidth = refinedFields.length > 4 ? '28%' : '34%';
        const otherFieldWidth = refinedFields.length > 4 ? '18%' : '22%';

        return [
            {
                label: groupByLabel,
                name: widgetState.groupBy,
                textOptions: { type: 'reference', referenceType },
                width: groupByFieldWidth,
            },
            ...refinedFields.map((field) => ({ ...field, width: otherFieldWidth })),
        ];
    }),
    tableData: computed<WidgetTableData[]>(() => {
        const tableData = sortArrayInObjectArray(
            getRefinedDateTableData(state.data?.results, widgetState.dateRange, ['cost_sum', 'usage_quantity_sum']),
            DATE_FIELD_NAME,
            ['cost_sum', 'usage_quantity_sum'],
        );
        return tableData;
    }),
    legends: computed<Legend[]>(() => getXYChartLegends(state.tableData, widgetState.groupBy, props.allReferenceTypeInfo)),
    showLegendsOnTable: computed(() => widgetState.options.legend_options?.enabled && widgetState.options.legend_options.show_at === 'table'),
    chart: null as XYChart | null,

});
const { selectorItems, selectedSelectorType } = useCostWidgetFrameHeaderDropdown({
    selectorOptions: computed(() => widgetState.options?.selector_options),
});

const { pageSize, thisPage } = useWidgetPagination(widgetState);
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => pageSize.value ?? 0),
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher<FullData>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<FullData|null> => {
    try {
        apiQueryHelper.setFilters([
            // { k: widgetState.groupBy, v: ['data-transfer.out', 'data-transfer.in', 'data-transfer.etc'], o: '' },
            ...widgetState.consoleFilters]);
        if (pageSize.value) apiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);

        const { status, response } = await fetchCostAnalyze({
            data_source_id: widgetState.options.cost_data_source,
            query: {
                granularity: widgetState.granularity,
                group_by: [widgetState.groupBy, USAGE_TYPE_QUERY_KEY],
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                fields: {
                    cost_sum: {
                        key: 'cost',
                        operator: 'sum',
                    },
                    usage_quantity_sum: {
                        key: 'usage_quantity',
                        operator: 'sum',
                    },
                },
                sort: [{ key: widgetState.groupBy, desc: true }],
                field_group: ['date', USAGE_TYPE_VALUE_KEY],
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
const drawChart = (chartData: XYChartData[]) => {
    const { chart, xAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(widgetState.dateRange));
    xAxis.get('baseInterval').timeUnit = 'month';
    chartHelper.setChartColors(chart, colorSet.value);

    if (widgetState.chartType === CHART_TYPE.LINE) {
        chart.get('cursor')?.lineX.setAll({
            visible: true,
        });
    }

    let legend;
    if (widgetState.options.legend_options?.enabled && widgetState.options.legend_options.show_at === 'chart') {
        legend = chartHelper.createLegend({
            nameField: 'name',
            layout: chartHelper.root.value?.horizontalLayout as any,
            verticalScrollbar: chartHelper.createScrollbar({
                orientation: 'horizontal',
                minHeight: 50,
            }),
        });
        chart.children.push(legend);
    }

    state.legends.forEach((l) => {
        const seriesSettings = {
            name: l.label,
            valueYField: l.name,
        };
        const series = widgetState.chartType === CHART_TYPE.LINE
            ? chartHelper.createXYLineSeries(chart, seriesSettings)
            : chartHelper.createXYColumnSeries(chart, { ...seriesSettings, stacked: true });
        chart.series.push(series);
        // set data processor
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat: DATE_FORMAT,
            dateFields: [DATE_FIELD_NAME],
        });
        const tooltip = chartHelper.createTooltip();
        if (selectedSelectorType.value === 'usage') {
            chartHelper.setXYSharedTooltipTextByUsage(chart, tooltip, USAGE_SOURCE_UNIT);
        } else {
            chartHelper.setXYSharedTooltipText(chart, tooltip, widgetState.currency);
        }
        (series as any).set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
    if (legend) legend.data.setAll(chart.series.values);

    state.chart = chart;
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (_thisPage = 1): Promise<FullData> => {
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
const handleSelectSelectorType = async (selected: SelectorType) => {
    selectedSelectorType.value = selected;
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
};
const handleToggleLegend = (index: number) => {
    chartHelper.toggleSeries(state.chart, index);
};
const handleUpdateThisPage = (_thisPage: number) => {
    thisPage.value = _thisPage;
    state.data = undefined;
    refreshWidget(_thisPage);
};


useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
    emit,
    widgetState,
    onCurrencyUpdate: async () => {
        if (!state.data?.results) return;
        chartHelper.refreshRoot();
        await nextTick();
        if (chartHelper.root.value) drawChart(state.chartData);
    },
});

defineExpose<WidgetExpose<FullData>>({
    initWidget,
    refreshWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  refresh-on-resize
                  class="aws-data-transfer-cost-trend"
                  v-on="widgetFrameEventHandlers"
    >
        <template v-if="selectorItems.length"
                  #header-right
        >
            <widget-frame-header-dropdown :items="selectorItems"
                                          :selected="selectedSelectorType"
                                          @select="handleSelectSelectorType"
            />
        </template>
        <div class="data-container">
            <div class="chart-wrapper">
                <p-data-loader class="chart-loader"
                               :loading="state.loading"
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
            <widget-data-table :loading="state.loading"
                               :fields="state.tableFields"
                               :items="state.tableData"
                               :currency="widgetState.currency"
                               :all-reference-type-info="allReferenceTypeInfo"
                               :this-page="thisPage"
                               :show-next-page="state.data ? state.data.more : false"
                               :legends="state.legends"
                               :color-set="colorSet"
                               :show-legend="state.showLegendsOnTable"
                               @toggle-legend="handleToggleLegend"
                               @update:thisPage="handleUpdateThisPage"
            />
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.aws-data-transfer-cost-trend {

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
