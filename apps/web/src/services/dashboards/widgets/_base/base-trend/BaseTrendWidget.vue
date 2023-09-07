<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import type { XYChart } from '@amcharts/amcharts5/xy';
import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

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
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrameNew.vue';
import { CHART_TYPE, WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
import type {
    WidgetExpose, WidgetProps,
    WidgetEmit,
    SelectorType,
} from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import {
    getDateAxisSettings,
    getXYChartLegends,
    getRefinedXYChartData,
} from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
// eslint-disable-next-line import/no-cycle
import { getWidgetLocationFilters } from '@/services/dashboards/widgets/_helpers/widget-helper';
import {
    getReferenceTypeOfGroupBy, getRefinedDateTableData, getWidgetTableDateFields, sortTableData,
} from '@/services/dashboards/widgets/_helpers/widget-table-helper';
import {
    useCostWidgetFrameHeaderDropdown,
} from '@/services/dashboards/widgets/_hooks/use-cost-widget-frame-header-dropdown';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
import { useWidgetPagination } from '@/services/dashboards/widgets/_hooks/use-widget-pagination';
// eslint-disable-next-line import/no-cycle
import { useWidget } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';
import type { CostAnalyzeDataModel, Legend, XYChartData } from '@/services/dashboards/widgets/type';


type Data = CostAnalyzeDataModel;

const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.legends?.length ?? 0),
});

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(widgetState.settings?.date_range?.end).format(DATE_FORMAT);
        const range = props.size === WIDGET_SIZE.full ? 11 : 3;
        const start = dayjs.utc(end).subtract(range, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
        params: {},
        query: {
            granularity: primitiveToQueryString(widgetState.granularity),
            group_by: arrayToQueryString([widgetState.groupBy]),
            period: objectToQueryString(widgetState.dateRange),
            filters: objectToQueryString(getWidgetLocationFilters(widgetState.options.filters)),
        },
    })),
});
const state = reactive({
    loading: true,
    data: null as Data | null,
    chart: null as null | XYChart,
    chartData: computed<XYChartData[]>(() => getRefinedXYChartData(state.data?.results, widgetState.groupBy)),
    tableFields: computed<Field[]>(() => {
        if (!widgetState.groupBy) return [];
        const refinedFields = getWidgetTableDateFields(widgetState.granularity, widgetState.dateRange, { type: 'cost' });
        const groupByLabel = COST_GROUP_BY_ITEM_MAP[widgetState.groupBy]?.label ?? widgetState.groupBy;
        const referenceType = getReferenceTypeOfGroupBy(props.allReferenceTypeInfo, widgetState.groupBy) as ReferenceType;
        return [
            {
                label: groupByLabel,
                name: widgetState.groupBy,
                textOptions: { type: 'reference', referenceType },
            },
            ...refinedFields,
        ];
    }),
    legends: computed<Legend[]>(() => getXYChartLegends(state.data?.results, widgetState.groupBy, props.allReferenceTypeInfo, state.disableReferenceColor)),
    disableReferenceColor: computed<boolean>(() => !!props.theme),
});

const { pageSize, thisPage } = useWidgetPagination(widgetState);

const { selectorItems, selectedSelectorType } = useCostWidgetFrameHeaderDropdown({
    selectorOptions: computed(() => widgetState.options?.selector_options ?? {}),
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher<Data>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<Data> => {
    try {
        apiQueryHelper.setFilters(widgetState.consoleFilters);
        if (pageSize.value) apiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);
        const { status, response } = await fetchCostAnalyze({
            data_source_id: widgetState.options.cost_data_source,
            query: {
                granularity: widgetState.granularity,
                group_by: [widgetState.groupBy],
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                fields: {
                    cost_sum: {
                        key: 'cost',
                        operator: 'sum',
                    },
                },
                sort: [{ key: '_total_cost_sum', desc: true }],
                field_group: ['date'],
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            return {
                results: sortTableData(getRefinedDateTableData(response.results, widgetState.dateRange)),
                more: response.more,
            };
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    return { results: [], more: false };
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
        chartHelper.setXYSharedTooltipText(chart, tooltip, widgetState.currency, props.currencyRates);
        series.set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
    if (legend) legend.data.setAll(chart.series.values);
    state.chart = chart;
};

const initWidget = async (data?: Data): Promise<Data> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (_thisPage = 1): Promise<Data> => {
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
const handleSelectSelectorType = (selected: SelectorType) => {
    selectedSelectorType.value = selected;
    refreshWidget();
};
const handleToggleLegend = (index) => {
    chartHelper.toggleSeries(state.chart, index);
};
const handleUpdateThisPage = (_thisPage: number) => {
    thisPage.value = _thisPage;
    state.data = undefined; // to disable next page button before fetching data
    refreshWidget(_thisPage);
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
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

defineExpose<WidgetExpose<Data>>({
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
                               :items="state.data ? state.data.results : []"
                               :currency="widgetState.currency"
                               :currency-rates="props.currencyRates"
                               :all-reference-type-info="props.allReferenceTypeInfo"
                               :legends="state.legends"
                               :color-set="colorSet"
                               :this-page="thisPage"
                               :show-next-page="state.data ? state.data.more : false"
                               show-legend
                               @toggle-legend="handleToggleLegend"
                               @update:thisPage="handleUpdateThisPage"
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
        .widget-data-table {
            height: auto;
        }
    }
}
</style>
