<template>
    <widget-frame :title="state.title"
                  :size="state.size"
                  :width="props.width"
                  class="aws-cloud-front-cost"
    >
        <template v-if="state.selectorItems.length"
                  #header-right
        >
            <widget-frame-header-dropdown :items="state.selectorItems"
                                          :selected="state.selectedSelectorType"
                                          @select="handleSelectSelectorType"
            />
        </template>
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
                           :items="state.data"
                           :currency="state.options.currency"
                           :currency-rates="props.currencyRates"
        />
    </widget-frame>
</template>

<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import { cloneDeep, random, range } from 'lodash';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import type { WidgetProps } from '@/services/dashboards/widgets/config';
import { GROUP_BY, CHART_TYPE } from '@/services/dashboards/widgets/config';
import type { HistoryDataModel } from '@/services/dashboards/widgets/type';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/view-config';

// TODO: sample data
const SAMPLE_RAW_DATA = {
    more: true,
    results: range(5).map((d) => ({
        project_id: `project${d + 1}`,
        'data-transfer.out': random(100, 1000),
        'requests.http': random(1000, 2000),
        'requests.https': random(100, 5000),
    })),
};
const CATEGORY_FIELD_NAME = GROUP_BY.PROJECT;

const props = defineProps<WidgetProps>();
const chartContext = ref<HTMLElement|null>(null);
const {
    createXYVerticalChart, createXYColumnSeries, setChartColors, createLegend,
    createTooltip, setXYSharedTooltipText,
    disposeRoot, refreshRoot,
} = useAmcharts5(chartContext);

const state = reactive({
    ...toRefs(useWidgetState<HistoryDataModel['results']>(props)),
    chartType: computed(() => state.options.chart_type ?? CHART_TYPE.LINE),
    labels: computed(() => ['data-transfer.out', 'requests.http', 'requests.https']),
    tableFields: computed(() => [
        GROUP_BY_ITEM_MAP[GROUP_BY.PROJECT],
        { name: 'data-transfer.out', label: 'Transfer-Out' },
        { name: 'requests.http', label: 'Requests (HTTP)' },
        { name: 'requests.https', label: 'Requests (HTTPS)' },
    ]),
});

/* Api */
const fetchData = async () => new Promise((resolve) => {
    setTimeout(() => {
        resolve(SAMPLE_RAW_DATA.results);
    }, 1000);
});

const drawChart = (chartData) => {
    const { chart, xAxis, yAxis } = createXYVerticalChart();
    setChartColors(chart, state.colorSet);
    yAxis.set('categoryField', CATEGORY_FIELD_NAME);
    yAxis.data.setAll(cloneDeep(chartData));
    // legend
    const legend = createLegend({
        nameField: 'name',
    });
    chart.children.push(legend);

    state.labels.forEach((label) => {
        const seriesSettings = {
            name: label,
            valueXField: label,
            categoryYField: CATEGORY_FIELD_NAME,
            xAxis,
            yAxis,
            baseAxis: yAxis,
            stacked: true,
        };
        const series = createXYColumnSeries(chart, seriesSettings);
        chart.series.push(series);
        const tooltip = createTooltip();
        setXYSharedTooltipText(chart, tooltip, state.options.currency, props.currencyRates);
        series.set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
    if (legend) legend.data.setAll(chart.series.values);
};

const initWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    drawChart(state.data);
    state.loading = false;
};

const refreshWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    refreshRoot();
    drawChart(state.data);
    state.loading = false;
};

/* Event */
const handleSelectSelectorType = (selected: string) => {
    state.selectedSelectorType = selected;
    refreshWidget();
};

useWidgetLifecycle({
    initWidget, disposeWidget: disposeRoot,
});

defineExpose({
    refreshWidget,
});
</script>
<style lang="postcss" scoped>
.aws-cloud-front-cost {
    .chart-wrapper {
        height: 50%;
        .chart-loader {
            height: 100%;
            .chart {
                height: 100%;
            }
        }
    }
}
</style>
