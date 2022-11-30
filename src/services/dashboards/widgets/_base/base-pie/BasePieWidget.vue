<template>
    <widget-frame :title="state.title"
                  :size="state.size"
                  :width="props.width"
    >
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
                           :items="state.chartData"
                           :currency="state.options.currency"
                           :currency-rates="props.currencyRates"
        />
    </widget-frame>
</template>

<script setup lang="ts">
import {
    computed,
    defineExpose,
    defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import { random } from 'lodash';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { GroupBy, WidgetProps } from '@/services/dashboards/widgets/config';
import { CHART_TYPE, GROUP_BY } from '@/services/dashboards/widgets/config';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/view-config';

type Data = Partial<Record<GroupBy, string>> & { usd_cost: number; };
type ChartData = Partial<Record<GroupBy, string>> & { usd_cost: number; };

const props = defineProps<WidgetProps>();

const chartContext = ref<HTMLElement|null>(null);
const {
    createPieChart, createDonutChart, createPieSeries,
    createTooltip, setPieTooltipText,
    disposeRoot, refreshRoot, setChartColors,
} = useAmcharts5(chartContext);

const state = reactive({
    ...toRefs(useWidgetState<Data[]>(props)),
    chart: null as null|ReturnType<typeof createPieChart | typeof createDonutChart>,
    series: null as null|ReturnType<typeof createPieSeries>,
    groupBy: computed<GroupBy>(() => state.options.group_by ?? GROUP_BY.PROVIDER),
    groupByLabel: computed<string>(() => {
        const groupBy = state.groupBy;
        return GROUP_BY_ITEM_MAP[groupBy]?.label ?? groupBy;
    }),
    chartType: computed(() => state.options.chart_type ?? CHART_TYPE.PIE),
    chartData: computed<Data[]>(() => {
        if (!state.data) return [];
        return state.data;
    }),
    tableFields: computed(() => [
        { label: state.groupByLabel, name: state.groupBy },
        { label: 'Cost', name: 'usd_cost', type: 'cost' },
    ]),
});

// TODO: api binding
const fetchData = async (): Promise<Data[]> => new Promise((resolve) => {
    setTimeout(() => {
        resolve([{
            provider: 'google cloud',
            usd_cost: random(1000, 5000),
        },
        {
            provider: 'aws',
            usd_cost: random(1000, 5000),
        },
        {
            provider: 'azure',
            usd_cost: random(1000, 5000),
        },
        {
            provider: 'alibaba',
            usd_cost: random(1000, 5000),
        },
        ]);
    }, 2000);
});

const drawChart = (chartData: ChartData[]) => {
    let chart;
    if (state.chartType === CHART_TYPE.DONUT) chart = createDonutChart();
    else chart = createPieChart();
    const seriesSettings = {
        categoryField: state.groupBy,
        valueField: 'usd_cost',
    };
    const series = createPieSeries(seriesSettings);
    const tooltip = createTooltip();
    chart.series.push(series);
    setPieTooltipText(series, tooltip, state.options.currency, props.currencyRates);
    setChartColors(chart, state.colorSet);
    series.slices.template.set('tooltip', tooltip);
    series.data.setAll(chartData);

    state.chart = chart;
    state.series = series;
};

// const updateChart = (chartData: ChartData[]) => {
//     if (!state.series) return;
//     state.series.data.setAll(chartData);
// };

const initWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    drawChart(state.chartData);
    state.loading = false;
};

const refreshWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    refreshRoot();
    drawChart(state.chartData);
    state.loading = false;
};

useWidgetLifecycle({
    initWidget, disposeWidget: disposeRoot,
});

defineExpose({
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
</style>
