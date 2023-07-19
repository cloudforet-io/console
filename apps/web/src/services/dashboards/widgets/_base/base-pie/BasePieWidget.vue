<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="base-pie-widget"
                  @refresh="refreshWidget"
    >
        <div class="data-container">
            <div class="chart-wrapper">
                <p-data-loader class="chart-loader"
                               :loading="state.loading"
                               :data="state.data"
                               loader-type="skeleton"
                               :loader-backdrop-opacity="1"
                               show-data-from-scratch
                >
                    <div ref="chartContext"
                         class="chart"
                    />
                    <template #loader>
                        <p-skeleton width="155px"
                                    height="155px"
                        />
                    </template>
                </p-data-loader>
            </div>
            <widget-data-table :loading="state.loading"
                               :fields="state.tableFields"
                               :items="state.data ? state.data.results: []"
                               :legends.sync="state.legends"
                               :currency="state.currency"
                               :currency-rates="props.currencyRates"
                               :this-page="state.thisPage"
                               :show-next-page="state.data ? state.data.more: false"
                               :color-set="colorSet"
                               :all-reference-type-info="props.allReferenceTypeInfo"
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
    computed,
    defineExpose,
    defineProps, nextTick, reactive, ref, toRef, toRefs,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import { color } from '@amcharts/amcharts5';
import { PDataLoader, PSkeleton } from '@spaceone/design-system';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import dayjs from 'dayjs';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ReferenceType } from '@/store/modules/reference/type';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import {
    getPieChartLegends, getRefinedPieChartData,
} from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
// eslint-disable-next-line import/no-cycle
import { getWidgetLocationFilters } from '@/services/dashboards/widgets/_helpers/widget-helper';
import { getReferenceTypeOfGroupBy } from '@/services/dashboards/widgets/_helpers/widget-table-helper';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { Legend, CostAnalyzeDataModel, PieChartData } from '@/services/dashboards/widgets/type';


type Data = CostAnalyzeDataModel['results'];
interface FullData {
    results: Data;
    more: boolean;
}

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const props = defineProps<WidgetProps>();
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.chartData?.length ?? 0),
});
const state = reactive({
    ...toRefs(useWidgetState<FullData>(props)),
    chart: null as null|ReturnType<typeof chartHelper.createPieChart | typeof chartHelper.createDonutChart>,
    series: null as null|ReturnType<typeof chartHelper.createPieSeries>,
    chartData: computed<PieChartData[]>(() => {
        if (!state.data?.results?.length) return [];
        return getRefinedPieChartData(state.data.results, state.groupBy, props.allReferenceTypeInfo);
    }),
    tableFields: computed<Field[]>(() => {
        if (!state.groupBy) return [];
        const groupByLabel = COST_GROUP_BY_ITEM_MAP[state.groupBy]?.label ?? state.groupBy;
        const referenceType = getReferenceTypeOfGroupBy(props.allReferenceTypeInfo, state.groupBy) as ReferenceType;
        return [
            {
                name: state.groupBy,
                label: groupByLabel,
                textOptions: { type: 'reference', referenceType },
            },
            {
                label: 'Cost',
                name: 'usd_cost_sum',
                textOptions: { type: 'cost' },
                textAlign: 'right',
            },
        ];
    }),
    legends: [] as Legend[],
    thisPage: 1,
    dateRange: computed<DateRange>(() => ({
        start: state.settings?.date_range?.start ?? dayjs.utc().format('YYYY-MM'),
        end: state.settings?.date_range?.end ?? dayjs.utc().format('YYYY-MM'),
    })),
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
let analyzeRequest: CancelTokenSource | undefined;
const fetchData = async (): Promise<FullData> => {
    if (analyzeRequest) {
        analyzeRequest.cancel('Next request has been called.');
        analyzeRequest = undefined;
    }
    analyzeRequest = axios.CancelToken.source();
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters(state.consoleFilters);
        if (state.pageSize) apiQueryHelper.setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
        const { results, more } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({
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
                sort: [{ key: 'usd_cost_sum', desc: true }],
                ...apiQueryHelper.data,
            },
        }, { cancelToken: analyzeRequest.token });
        analyzeRequest = undefined;
        return { results, more };
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [], more: false };
    }
};

const drawChart = (chartData: PieChartData[]) => {
    let chart;
    if (state.chartType === CHART_TYPE.DONUT) chart = chartHelper.createDonutChart();
    else chart = chartHelper.createPieChart();
    const seriesSettings = {
        categoryField: state.groupBy,
        valueField: 'usd_cost_sum',
    };
    const series = chartHelper.createPieSeries(seriesSettings);
    series.labels.template.set('forceHidden', true);
    series.ticks.template.set('forceHidden', true);
    chart.series.push(series);
    chartHelper.setChartColors(chart, colorSet.value);

    if (chartData.some((d) => d.usd_cost_sum && d.usd_cost_sum > 0)) {
        const tooltip = chartHelper.createTooltip();
        chartHelper.setPieTooltipText(series, tooltip, state.currency, props.currencyRates);
        series.slices.template.set('tooltip', tooltip);
        series.data.setAll(chartData);
    } else {
        series.data.setAll([{
            usd_cost_sum: 1,
        }]);
        series.slices.template.setAll({
            fill: color(gray[200]),
            strokeOpacity: 0,
            forceInactive: true,
        });
    }

    state.chart = chart;
    state.series = series;
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.legends = getPieChartLegends(state.data.results, state.groupBy);
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (thisPage = 1): Promise<FullData> => {
    await nextTick();
    state.loading = true;
    state.thisPage = thisPage;
    state.data = await fetchData();
    state.legends = getPieChartLegends(state.data.results, state.groupBy);
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

/* Event */
const handleToggleLegend = (index) => {
    chartHelper.toggleSeries(state.chart, index);
};
const handleUpdateThisPage = (thisPage: number) => {
    state.thisPage = thisPage;
    state.data = undefined;
    refreshWidget(thisPage);
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
    state,
    onCurrencyUpdate: async () => {
        if (!state.data) return;
        state.legends = getPieChartLegends(state.data.results, state.groupBy);
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

<style scoped lang="postcss">
.base-pie-widget {
    .data-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .chart-wrapper {
        height: 155px;
        margin-bottom: 1rem;
        .chart {
            height: 100%;
        }
    }
    .chart-loader {
        height: 100%;
    }
    .widget-data-table {
        flex-grow: 1;
    }
    &.full {
        .widget-data-table {
            height: auto;
        }
    }
}
</style>
