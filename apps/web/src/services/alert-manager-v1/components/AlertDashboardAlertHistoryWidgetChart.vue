<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';

import type { Series } from '@amcharts/amcharts5';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDataLoader, PSkeleton } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAmcharts5 } from '@/common/composables/amcharts5';
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
const chartHelper = useAmcharts5(chartContext);
const state = reactive(({
    loading: true,
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

const drawChart = () => {
    // refresh root for deleting previous chart
    chartHelper.refreshRoot();

    // create chart
    const { chart, xAxis } = chartHelper.createXYDateChart({
        paddingTop: 30,
    });

    // set date formatter for tooltip text
    chartHelper.root.value?.dateFormatter.setAll({
        dateFormat: 'd MMM, yyyy',
        dateFields: ['valueX'],
    });

    // set axis
    xAxis.get('baseInterval').timeUnit = 'day';
    // set minGridDistance to xAxis
    xAxis.get('renderer').setAll({
        minGridDistance: 30,
    });

    [ALERT_STATE.RESOLVED, ALERT_STATE.OPEN].forEach((d) => {
        // create column series
        const color = d === ALERT_STATE.OPEN ? OPEN_COLOR : RESOLVED_COLOR;
        const seriesSettings = {
            name: state.alertStateLabel[d],
            valueYField: d,
            stacked: true,
            strokeWidth: 1,
            fill: color,
        };

        // create series
        const series = chartHelper.createXYColumnSeries(chart, seriesSettings);
        chart.series.push(series);

        // set data processor on series
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat: 'yyyy-MM-dd',
            dateFields: ['date'],
        });

        // create tooltip and set on series
        const tooltip = chartHelper.createTooltip();
        chartHelper.setXYSharedTooltipText(chart, tooltip);
        (series as Series).set('tooltip', tooltip);

        // set data on series
        series.data.setAll(cloneDeep(state.chartData));
    });

    // create legend
    const legend = chartHelper.createLegend({
        nameField: 'name',
        y: 0,
    });
    chart.children.push(legend);
    legend.data.setAll(chart.series.values);
};

/* api */
const getDailyAlertHistory = async () => {
    try {
        const { results } = await SpaceConnector.client.monitoring.dashboard.dailyAlertHistory({
            start: props.currentDate.format('YYYY-MM-01'),
            end: props.currentDate.add(1, 'month').format('YYYY-MM-01'),
            activated_projects: props.activatedProjects,
        });
        if (results.length) state.chartData = initChartData(results);
        else state.chartData = [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.chartData = [];
    }
};

watch([() => chartContext.value, () => state.chartData, () => state.alertStateLabel], ([_chartContext, data]) => {
    if (_chartContext && data) {
        drawChart();
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
                   :data="state.chartData"
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
