<template>
    <widget-frame :title="state.title"
                  :size="state.size"
                  width="704px"
                  class="base-trend-widget"
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
    computed, defineExpose, defineProps, nextTick, reactive, ref,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import { cloneDeep, random } from 'lodash';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { GroupBy, WidgetProps } from '@/services/dashboards/widgets/config';
import { GROUP_BY, CHART_TYPE } from '@/services/dashboards/widgets/config';
import type { HistoryDataModel, XYChartData } from '@/services/dashboards/widgets/type';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/view-config';
// eslint-disable-next-line import/no-cycle
import { getRefinedXYChartData } from '@/services/dashboards/widgets/widget-helper';

// TODO: sample data
const SAMPLE_RAW_DATA = {
    more: true,
    results: [
        {
            provider: 'aws',
            usd_cost_sum: [
                { date: '2022-08', value: random(100, 5000) },
                // { date: '2022-09', value: 0 },
                { date: '2022-10', value: random(100, 5000) },
                { date: '2022-11', value: random(100, 5000) },
            ],
        },
        {
            provider: 'google_cloud',
            usd_cost_sum: [
                { date: '2022-08', value: random(100, 5000) },
                { date: '2022-09', value: random(100, 5000) },
                { date: '2022-10', value: random(100, 5000) },
                { date: '2022-11', value: random(100, 5000) },
            ],
        },
        {
            provider: 'azure',
            usd_cost_sum: [
                { date: '2022-08', value: random(100, 5000) },
                { date: '2022-09', value: random(100, 5000) },
                { date: '2022-10', value: random(100, 5000) },
                { date: '2022-11', value: random(100, 5000) },
            ],
        },
    ],
};

const DATE_FORMAT = 'yyyy-MM';
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();

const chartContext = ref<HTMLElement|null>(null);
const {
    createXYDateChart, createXYLineSeries, createXYStackedColumnSeries,
    createTooltip, setXYSharedTooltipText, createDataProcessor,
    disposeRoot,
} = useAmcharts5(chartContext);

const state = reactive({
    ...useWidgetState<HistoryDataModel['results']>(props),
    groupBy: computed<GroupBy>(() => state.options.group_by ?? GROUP_BY.PROVIDER),
    groupByLabel: computed<string>(() => {
        const groupBy = state.groupBy;
        return GROUP_BY_ITEM_MAP[groupBy]?.label ?? groupBy;
    }),
    chartType: computed(() => state.options.chart_type ?? CHART_TYPE.LINE),
    chartData: computed(() => getRefinedXYChartData(state.data, state.groupBy)),
    labels: computed(() => {
        if (!state.data) return [];
        return state.data.map((d) => d[state.groupBy]);
    }),
    tableFields: computed(() => [ // TODO: fill date fields
        { label: state.groupByLabel, name: state.groupBy },
    ]),
});

const fetchData = async () => new Promise((resolve) => {
    setTimeout(() => {
        resolve(SAMPLE_RAW_DATA.results);
    }, 1000);
});

const drawChart = (chartData: XYChartData[]) => {
    const { chart, xAxis } = createXYDateChart();
    xAxis.get('baseInterval').timeUnit = 'month';

    if (state.chartType === CHART_TYPE.LINE) {
        chart.get('cursor')?.lineX.setAll({
            visible: true,
        });
    }

    state.labels.forEach((label) => {
        const seriesSettings = {
            name: label,
            valueYField: label,
        };
        const series = state.chartType === CHART_TYPE.LINE
            ? createXYLineSeries(chart, seriesSettings)
            : createXYStackedColumnSeries(chart, seriesSettings);

        // set data processor
        series.data.processor = createDataProcessor({
            dateFormat: DATE_FORMAT,
            dateFields: [DATE_FIELD_NAME],
        });

        const tooltip = createTooltip();
        setXYSharedTooltipText(chart, tooltip, state.options.currency, props.currencyRates); // mock currency
        series.set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
};

const initWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    drawChart(state.chartData);
    state.loading = false;
};

useWidgetLifecycle({
    initWidget, disposeWidget: disposeRoot,
});

defineExpose({
    refreshWidget: initWidget,
});
</script>

<style lang="postcss" scoped>
.base-trend-widget {
    .chart-wrapper {
        height: 10rem;
        .chart-loader {
            height: 100%;
            .chart {
                height: 100%;
            }
        }
    }
}
</style>
