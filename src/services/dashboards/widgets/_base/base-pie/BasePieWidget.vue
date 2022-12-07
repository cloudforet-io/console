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
                           show-legend
                           :legends="state.legends"
                           :currency="state.options.currency"
                           :currency-rates="props.currencyRates"
                           size="md"
                           :disable-next-page="state.limit"
                           :this-page.sync="state.thisPage"
                           @toggle-legend="handleToggleLegend"
        >
            <template #detail-provider>
                This is test popover content
            </template>
            <template #detail-usd_cost>
                This is test popover content2
            </template>
        </widget-data-table>
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

import type {
    Field,
    LegendConfig,
} from '@/services/dashboards/widgets/_components/type';
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
    disposeRoot, refreshRoot, setChartColors, toggleSeries,
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
    tableFields: computed<Field[]>(() => [
        {
            label: state.groupByLabel,
            name: state.groupBy,
            tooltipText: 'test tooltip',
            icon: (item) => (item?.provider.length > 4 ? 'ic_tree_project-group' : 'ic_tree_project'),
            link: '/home-dashboard',
            detailOptions: {
                enabled: true,
                type: 'popover',
            },
        },
        {
            label: 'Cost',
            name: 'usd_cost',
            type: 'cost',
            textAlign: 'right',
            textOptions: {
                type: 'size',
                display_unit: 'GB',
                source_unit: 'MB',
            },
            detailOptions: {
                enabled: true,
                type: 'popover',
            },
            rapidIncrease: (item) => item?.usd_cost > 30000,
        },
    ]),
    legends: computed<LegendConfig[]>(() => state.chartData.map((i) => ({
        name: i.provider,
    }))),
    thisPage: 1,
    limit: computed(() => state.thisPage > 3),
});

// TODO: api binding
const fetchData = async (): Promise<Data[]> => new Promise((resolve) => {
    setTimeout(() => {
        resolve([{
            provider: 'google cloud',
            usd_cost: random(10000, 50000),
        },
        {
            provider: 'aws',
            usd_cost: random(10000, 50000),
        },
        {
            provider: 'azure',
            usd_cost: random(10000, 50000),
        },
        {
            provider: 'alibaba',
            usd_cost: random(10000, 50000),
        },
        ]);
    }, 1000);
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
    chart.series.push(series);
    setChartColors(chart, state.colorSet);

    const tooltip = createTooltip();
    setPieTooltipText(series, tooltip, state.options.currency, props.currencyRates);
    series.slices.template.set('tooltip', tooltip);
    series.data.setAll(chartData);

    state.chart = chart;
    state.series = series;
};

// const updateChart = (chartData: ChartData[]) => {
//     if (!state.series) return;
//     state.series.data.setAll(chartData);
// };

const handleToggleLegend = (index) => {
    toggleSeries(state.chart, index);
};

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
.widget-data-table {
    height: 50%;
}
</style>
