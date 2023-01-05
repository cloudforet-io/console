<template>
    <widget-frame v-bind="widgetFrameProps">
        <div class="chart-wrapper">
            <p-data-loader class="chart-loader"
                           :loading="state.loading"
                           :data="state.data"
                           loader-type="skeleton"
                           show-data-from-scratch
            >
                <div ref="chartContext"
                     class="chart"
                />
            </p-data-loader>
        </div>

        <widget-data-table :loading="state.loading"
                           :fields="state.tableFields"
                           :items="state.data?.results"
                           :legends.sync="state.legends"
                           :currency="state.currency"
                           :currency-rates="props.currencyRates"
                           :this-page="state.thisPage"
                           :show-next-page="state.data?.more"
                           :color-set="state.colorSet"
                           :all-reference-type-info="props.allReferenceTypeInfo"
                           show-legend
                           @toggle-legend="handleToggleLegend"
                           @update:thisPage="handleUpdateThisPage"
        />
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed,
    defineExpose,
    defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ReferenceType } from '@/store/modules/reference/type';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import {
    getPieChartLegends, getRefinedPieChartData,
} from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import { getReferenceTypeOfGroupBy } from '@/services/dashboards/widgets/_helpers/widget-table-helper';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
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
        const groupByLabel = GROUP_BY_ITEM_MAP[state.groupBy]?.label ?? state.groupBy;
        const referenceType = getReferenceTypeOfGroupBy(props.allReferenceTypeInfo, state.groupBy) as ReferenceType;
        return [
            { name: state.groupBy, label: groupByLabel, textOptions: { type: 'reference', referenceType } },
            { label: 'Cost', name: 'usd_cost_sum', textOptions: { type: 'cost' } },
        ];
    }),
    legends: [] as Legend[],
    thisPage: 1,
    dateRange: computed<DateRange>(() => ({
        start: dayjs.utc(state.settings?.date_range?.start).format('YYYY-MM'),
        end: dayjs.utc(state.settings?.date_range?.end).format('YYYY-MM'),
    })),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
const fetchData = async (): Promise<FullData> => {
    try {
        const query: any = {
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
        };
        if (state.pageSize) {
            query.page = { start: getPageStart(state.thisPage, state.pageSize), limit: state.pageSize };
        }
        const { results, more } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({ query });
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
    chart.series.push(series);
    chartHelper.setChartColors(chart, state.colorSet);

    const tooltip = chartHelper.createTooltip();
    chartHelper.setPieTooltipText(series, tooltip, state.currency, props.currencyRates);
    series.slices.template.set('tooltip', tooltip);
    series.data.setAll(chartData);

    state.chart = chart;
    state.series = series;
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.legends = getPieChartLegends(state.data.results, state.groupBy);
    await nextTick();
    drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (thisPage = 1): Promise<FullData> => {
    state.loading = true;
    state.thisPage = thisPage;
    state.data = await fetchData();
    state.legends = getPieChartLegends(state.data.results, state.groupBy);
    await nextTick();
    chartHelper.refreshRoot();
    drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

/* Event */
const handleToggleLegend = (index) => {
    chartHelper.toggleSeries(state.chart, index);
};
const handleUpdateThisPage = (thisPage: number) => {
    state.thisPage = thisPage;
    refreshWidget(thisPage);
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
});

defineExpose<WidgetExpose<FullData>>({
    initWidget,
    refreshWidget,
});
</script>

<style scoped lang="postcss">
.chart-wrapper {
    height: 155px;
    .chart {
        height: 100%;
    }
}
.chart-loader {
    height: 100%;
}
.widget-data-table {
    height: 50%;
}
</style>
