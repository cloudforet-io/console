<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="count-of-pass-and-fail-findings"
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
                </p-data-loader>
            </div>
            <div class="table-pagination-wrapper">
                <p-text-pagination :this-page.sync="state.thisPage"
                                   :disable-next-page="!state.showNextPage"
                >
                    <template #default>
                        <span class="this-page">{{ state.thisPage }}</span>
                        <span v-if="state.showNextPage"> / ...</span>
                    </template>
                </p-text-pagination>
            </div>
        </div>
    </widget-frame>
</template>
<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import type * as am5xy from '@amcharts/amcharts5/xy';
import { PDataLoader, PTextPagination } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep, random } from 'lodash';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import { green, red } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetProps, WidgetExpose } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';


const DATE_FORMAT = 'YYYY-MM';
const FINDING_STATUS_MAP = {
    pass: { label: 'Pass', color: green[500] },
    fail: { label: 'Fail', color: red[400] },
};
const props = defineProps<WidgetProps>();

const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);
const state = reactive({
    ...toRefs(useWidgetState(props)),
    thisPage: 1,
    dateRange: computed<DateRange>(() => ({
        start: dayjs.utc(state.settings?.date_range?.start).format(DATE_FORMAT),
        end: dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT),
    })),
    // TODO: remove sampleData
    showNextPage: computed(() => state.thisPage * 8 <= 20),
    sampleData: computed(() => [...Array(20)].map(() => ({
        region_code: `region-${random(0, 1000)}`,
        pass: random(0, 100),
        fail: random(0, 100),
    }))),
    chartData: computed(() => {
        const start = (state.thisPage - 1) * 8;
        const end = start + 8;
        return state.sampleData.slice(start, end);
    }),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

const fetchData = async () => {
    // TODO: fetch data
};
const drawChart = (chartData) => {
    if (!state.groupBy) return;
    const { chart, xAxis, yAxis } = chartHelper.createXYHorizontalChart();
    yAxis.set('categoryField', state.groupBy);
    yAxis.data.setAll(cloneDeep(chartData));
    // legend
    const legend = chartHelper.createLegend({
        nameField: 'name',
    });
    chart.children.push(legend);

    Object.entries(FINDING_STATUS_MAP).forEach(([k, v]) => {
        const seriesSettings: Partial<am5xy.IXYSeriesSettings> = {
            name: v.label,
            valueXField: k,
            categoryYField: state.groupBy,
            xAxis,
            yAxis,
            baseAxis: yAxis,
            stacked: true,
            fill: v.color,
        };
        const series = chartHelper.createXYColumnSeries(chart, seriesSettings);
        series.columns.template.setAll({
            height: 20,
        });
        chart.series.push(series);
        series.data.setAll(cloneDeep(chartData));
    });
    if (legend) legend.data.setAll(chart.series.values);
};
const initWidget = async (data) => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};
const refreshWidget = async (thisPage = 1) => {
    state.loading = true;
    state.thisPage = thisPage;
    state.data = await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

useWidgetLifecycle({
    disposeWidget: undefined,
    refreshWidget,
    props,
    state,
});
defineExpose<WidgetExpose>({
    initWidget,
    refreshWidget,
});
</script>
<style lang="postcss" scoped>
.count-of-pass-and-fail-findings {
    .data-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        .chart-wrapper {
            height: 85%;
            margin-bottom: 1rem;
            .chart-loader {
                height: 100%;
                .chart {
                    height: 100%;
                }
            }
        }
    }
    .table-pagination-wrapper {
        flex-shrink: 0;
        text-align: center;
        .this-page {
            font-weight: bold;
        }
    }
}
</style>
