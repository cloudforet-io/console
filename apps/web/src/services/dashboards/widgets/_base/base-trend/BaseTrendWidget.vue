<template>
    <widget-frame v-bind="widgetFrameProps"
                  refresh-on-resize
                  class="base-trend-widget"
                  @refresh="refreshWidget"
    >
        <template v-if="state.selectorItems.length"
                  #header-right
        >
            <widget-frame-header-dropdown :items="state.selectorItems"
                                          :selected="state.selectedSelectorType"
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
                               :currency="state.currency"
                               :currency-rates="props.currencyRates"
                               :all-reference-type-info="props.allReferenceTypeInfo"
                               :legends.sync="state.legends"
                               :color-set="colorSet"
                               :this-page="state.thisPage"
                               :show-next-page="state.data ? state.data.more : false"
                               show-legend
                               @toggle-legend="handleToggleLegend"
                               @update:thisPage="handleUpdateThisPage"
            />
        </div>
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef, toRefs,
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

import type { ReferenceType } from '@/store/modules/reference/type';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import { CHART_TYPE, WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
import type {
    WidgetExpose, WidgetProps,
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
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { CostAnalyzeDataModel, Legend, XYChartData } from '@/services/dashboards/widgets/type';


type Data = CostAnalyzeDataModel;

const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.legends?.length ?? 0),
});
const state = reactive({
    ...toRefs(useWidgetState<Data>(props)),
    chart: null as null | XYChart,
    chartData: computed<XYChartData[]>(() => getRefinedXYChartData(state.data?.results, state.groupBy)),
    tableFields: computed<Field[]>(() => {
        if (!state.groupBy) return [];
        const refinedFields = getWidgetTableDateFields(state.granularity, state.dateRange, { type: 'cost' });
        const groupByLabel = COST_GROUP_BY_ITEM_MAP[state.groupBy]?.label ?? state.groupBy;
        const referenceType = getReferenceTypeOfGroupBy(props.allReferenceTypeInfo, state.groupBy) as ReferenceType;
        return [
            {
                label: groupByLabel,
                name: state.groupBy,
                textOptions: { type: 'reference', referenceType },
            },
            ...refinedFields,
        ];
    }),
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT);
        const range = props.size === WIDGET_SIZE.full ? 11 : 3;
        const start = dayjs.utc(end).subtract(range, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    legends: [] as Legend[],
    thisPage: 1,
    disableReferenceColor: computed<boolean>(() => !!props.theme),
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
        params: {},
        query: {
            granularity: primitiveToQueryString(state.granularity),
            group_by: arrayToQueryString([state.groupBy]),
            period: objectToQueryString(state.dateRange),
            filters: objectToQueryString(getWidgetLocationFilters(state.options.filters)),
        },
    })),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher<Data>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<Data> => {
    try {
        apiQueryHelper.setFilters(state.consoleFilters);
        if (state.pageSize) apiQueryHelper.setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
        const res = await fetchCostAnalyze({
            query: {
                granularity: state.granularity,
                group_by: [state.groupBy],
                start: state.dateRange.start,
                end: state.dateRange.end,
                fields: {
                    usd_cost_sum: {
                        key: 'usd_cost',
                        operator: 'sum',
                    },
                },
                sort: [{ key: '_total_usd_cost_sum', desc: true }],
                field_group: ['date'],
                ...apiQueryHelper.data,
            },
        });
        if (res) {
            return { results: sortTableData(getRefinedDateTableData(res.results, state.dateRange)), more: res.more };
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    return { results: [], more: false };
};

/* Util */
const drawChart = (chartData: XYChartData[]) => {
    const { chart, xAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(state.dateRange));
    xAxis.get('baseInterval').timeUnit = 'month';
    chartHelper.setChartColors(chart, colorSet.value);

    if (state.chartType === CHART_TYPE.LINE) {
        chart.get('cursor')?.lineX.setAll({
            visible: true,
        });
    }

    let legend;
    if (state.options.legend_options?.enabled && state.options.legend_options.show_at === 'chart') {
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
        const series = state.chartType === CHART_TYPE.LINE
            ? chartHelper.createXYLineSeries(chart, seriesSettings)
            : chartHelper.createXYColumnSeries(chart, { ...seriesSettings, stacked: true });
        chart.series.push(series);
        // set data processor
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat: DATE_FORMAT,
            dateFields: [DATE_FIELD_NAME],
        });
        const tooltip = chartHelper.createTooltip();
        chartHelper.setXYSharedTooltipText(chart, tooltip, state.currency, props.currencyRates);
        series.set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
    if (legend) legend.data.setAll(chart.series.values);
    state.chart = chart;
};

const initWidget = async (data?: Data): Promise<Data> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.legends = getXYChartLegends(state.data.results, state.groupBy, props.allReferenceTypeInfo, state.disableReferenceColor);
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (thisPage = 1): Promise<Data> => {
    await nextTick();
    state.loading = true;
    state.thisPage = thisPage;
    state.data = await fetchData();
    state.legends = getXYChartLegends(state.data.results, state.groupBy, props.allReferenceTypeInfo, state.disableReferenceColor);
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

/* Event */
const handleSelectSelectorType = (selected: string) => {
    state.selectedSelectorType = selected;
    refreshWidget();
};
const handleToggleLegend = (index) => {
    chartHelper.toggleSeries(state.chart, index);
};
const handleUpdateThisPage = (thisPage: number) => {
    state.thisPage = thisPage;
    state.data = undefined; // to disable next page button before fetching data
    refreshWidget(thisPage);
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
    state,
    onCurrencyUpdate: async () => {
        if (!state.data) return;
        state.legends = getXYChartLegends(state.data.results, state.groupBy, props.allReferenceTypeInfo, state.disableReferenceColor);
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
