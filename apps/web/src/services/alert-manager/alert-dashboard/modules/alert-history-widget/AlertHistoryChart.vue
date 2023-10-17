<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';

import {
    XYChart, CategoryAxis, ValueAxis, ColumnSeries, Legend, XYCursor,
} from '@amcharts/amcharts4/charts';
import { create, color, percent } from '@amcharts/amcharts4/core';
import { PDataLoader, PSkeleton } from '@spaceone/design-system';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import config from '@/lib/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray, red } from '@/styles/colors';

interface ChartData {
    date: string;
    open: number | null;
    resolved: number | null;
    openPercentage?: number;
    resolvedPercentage?: number;
}

interface Props {
    currentDate: Dayjs;
    activatedProjects?: string[];
}

const ALERT_STATE = {
    OPEN: 'open',
    RESOLVED: 'resolved',
};
const OPEN_COLOR = red[400];
const RESOLVED_COLOR = gray[400];

const props = withDefaults(defineProps<Props>(), {
    currentDate: () => dayjs.utc(),
    activatedProjects: () => ([]),
});

const chartContext = ref<HTMLElement|null>(null);
const state = reactive(({
    loading: true,
    chartRef: null as HTMLElement | null,
    chart: null,
    chartRegistry: {},
    chartData: [] as ChartData[],
    currentMonthStart: computed(() => dayjs.utc(props.currentDate).startOf('month')),
    currentMonthEnd: computed(() => dayjs.utc(props.currentDate).endOf('month')),
    alertStateLabel: computed(() => ({
        [ALERT_STATE.OPEN]: i18n.t('MONITORING.ALERT.DASHBOARD.OPEN'),
        [ALERT_STATE.RESOLVED]: i18n.t('MONITORING.ALERT.DASHBOARD.RESOLVED'),
    })),
}));

/* util */
const initChartData = (data) => {
    const chartData = [] as ChartData[];
    let now = state.currentMonthStart.clone();

    while (now.isSameOrBefore(state.currentMonthEnd, 'day')) {
        // eslint-disable-next-line no-loop-func
        const existData = data.find((d) => d.date === now.format('YYYY-MM-DD'));

        if (existData) {
            const openPercentage = Math.round((existData.open_count / existData.total_count) * 100);
            const resolvedPercentage = 100 - openPercentage;
            chartData.push({
                date: now.format('YYYY-MM-DD'),
                open: existData.open_count,
                resolved: existData.resolved_count,
                openPercentage,
                resolvedPercentage,
            });
        } else {
            chartData.push({
                date: now.format('YYYY-MM-DD'),
                open: null,
                resolved: null,
            });
        }

        now = now.add(1, 'day');
    }
    return chartData;
};
const disposeChart = (ctx) => {
    if (state.chartRegistry[ctx]) {
        state.chartRegistry[ctx].dispose();
        delete state.chartRegistry[ctx];
    }
};
const drawChart = (ctx) => {
    const createChart = () => {
        disposeChart(ctx);
        state.chartRegistry[ctx] = create(ctx, XYChart);
        return state.chartRegistry[ctx];
    };
    const chart = createChart();
    state.chart = chart;
    if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
    chart.paddingLeft = -5;
    chart.paddingBottom = -10;
    chart.paddingTop = -10;
    chart.data = state.chartData;

    const dateAxis = chart.xAxes.push(new CategoryAxis());
    dateAxis.dataFields.category = 'date';
    dateAxis.tooltip.disabled = true;
    dateAxis.renderer.minGridDistance = 35;
    dateAxis.fontSize = 12;
    dateAxis.renderer.labels.template.fill = color(gray[600]);
    dateAxis.renderer.grid.template.stroke = color(gray[500]);
    dateAxis.renderer.labels.template.adapter.add('text', (text, target) => dayjs.utc(target.dataItem.category).format('M/D'));
    dateAxis.renderer.labels.template.adapter.add('fill', (fill, target) => {
        const today = dayjs.utc().format('YYYY-MM-DD');
        if (target.dataItem.category === today) return color(gray[900]);
        return color(gray[600]);
    });
    dateAxis.renderer.grid.template.adapter.add('strokeOpacity', (strokeOpacity, target) => {
        const today = dayjs.utc().format('YYYY-MM-DD');
        if (target.dataItem.category === today) return 1;
        return 0;
    });

    const valueAxis = chart.yAxes.push(new ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.minGridDistance = 25;
    valueAxis.min = 0;
    valueAxis.fontSize = 12;
    valueAxis.extraMax = 0.1;
    valueAxis.renderer.grid.template.strokeOpacity = 1;
    valueAxis.renderer.grid.template.stroke = color(gray[200]);
    valueAxis.renderer.labels.template.fill = color(gray[600]);

    const createSeries = (name, _color) => {
        const series = chart.series.push(new ColumnSeries());
        series.name = state.alertStateLabel[name];
        series.stacked = true;
        series.dataFields.categoryX = 'date';
        series.dataFields.valueY = name;
        series.fill = color(_color);
        series.stroke = color('white');
        series.strokeWidth = 1;
        series.strokeOpacity = 0;
        series.columns.template.width = percent(35);

        // tooltip
        if (name === ALERT_STATE.OPEN) {
            series.columns.template.tooltipText = `[${OPEN_COLOR}]${state.alertStateLabel[ALERT_STATE.OPEN]}: [${OPEN_COLOR}; bold]{open} ({openPercentage}%)
[${RESOLVED_COLOR}]${state.alertStateLabel[ALERT_STATE.RESOLVED]}: [${RESOLVED_COLOR}; bold]{resolved} ({resolvedPercentage}%)`;
            series.tooltip.pointerOrientation = 'down';
            series.columns.template.tooltipX = percent(50);
            series.columns.template.tooltipY = percent(0);
            series.tooltip.dy = -5;
            series.tooltip.fontSize = 14;
            series.tooltip.getFillFromObject = false;
            series.tooltip.label.fill = color(gray[900]);
            series.tooltip.autoTextColor = false;
            series.tooltip.background.fillOpacity = 1;
            series.tooltip.background.stroke = color(gray[400]);
        }
    };
    createSeries(ALERT_STATE.RESOLVED, RESOLVED_COLOR);
    createSeries(ALERT_STATE.OPEN, OPEN_COLOR);

    chart.legend = new Legend();
    chart.legend.useDefaultMarker = true;
    chart.legend.position = 'top';
    chart.legend.contentAlign = 'left';
    chart.legend.fontSize = 12;
    const marker = chart.legend.markers;
    marker.template.width = 10;
    marker.template.height = 10;
    marker.template.children.getIndex(0).cornerRadius(12, 12, 12, 12);

    chart.cursor = new XYCursor();
    chart.cursor.lineX.strokeOpacity = 0;
    chart.cursor.lineY.strokeOpacity = 0;
    chart.cursor.behavior = 'none';
};

/* api */
const getDailyAlertHistory = async () => {
    try {
        const { results } = await SpaceConnector.client.monitoring.dashboard.dailyAlertHistory({
            start: props.currentDate.format('YYYY-MM-01'),
            end: props.currentDate.add(1, 'month').format('YYYY-MM-01'),
            activated_projects: props.activatedProjects,
        });
        state.chartData = initChartData(results);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.chartData = [];
    }
};

watch([() => chartContext.value, () => state.chartData, () => state.alertStateLabel], ([_chartContext, data]) => {
    if (_chartContext && data) {
        drawChart(_chartContext);
    }
});
watch(() => props.currentDate, async () => {
    state.loading = true;
    await getDailyAlertHistory();
    state.loading = false;
});
watch(() => props.activatedProjects, async (activatedProjects) => {
    if (activatedProjects) {
        state.loading = true;
        await getDailyAlertHistory();
        state.loading = false;
    } else {
        state.loading = false;
    }
}, { immediate: true });
</script>

<template>
    <p-data-loader :loading="state.loading"
                   class="alert-history-chart"
    >
        <template #loader>
            <p-skeleton width="100%"
                        height="100%"
            />
        </template>
        <div ref="chartContext"
             class="chart"
        />
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.alert-history-chart {
    height: 100%;

    .chart {
        height: 100%;
    }
}
</style>
<style lang="postcss">
.AlertHistoryChartAxisRendererX-group {
    @screen tablet {
        display: none;
    }
}
</style>
