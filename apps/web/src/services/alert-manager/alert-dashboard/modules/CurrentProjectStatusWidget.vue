<script lang="ts" setup>

import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDataLoader } from '@spaceone/design-system';
import {
    computed, reactive, ref, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import config from '@/lib/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    violet, green, red, yellow, white, gray,
} from '@/styles/colors';

enum PROJECT_STATUS {
    issue = 'issue',
    maintenance = 'maintenance',
    healthy = 'healthy',
}
interface ChartData {
    status: keyof typeof PROJECT_STATUS;
    count: number;
    color: string;
}

const { t } = useI18n();

const loaderRef = ref(null as null | HTMLElement);
const chartRef = ref(null as null | HTMLElement);
const state = reactive({
    loading: true,
    count: {
        total: 0,
        issue: 0,
        maintenance: 0,
        healthy: 0,
    },
    data: computed(() => ([
        {
            status: PROJECT_STATUS.issue,
            count: state.count.issue,
            color: red[400],
        },
        {
            status: PROJECT_STATUS.maintenance,
            count: state.count.maintenance,
            color: yellow[400],
        },
        {
            status: PROJECT_STATUS.healthy,
            count: state.count.healthy,
            color: green[500],
        },
    ] as ChartData[])),
    chart: null as null | any,
    chartRegistry: {},
});

/* util */
const disposeChart = (ctx) => {
    if (state.chartRegistry[ctx]) {
        state.chartRegistry[ctx].dispose();
        delete state.chartRegistry[ctx];
    }
};
const drawChart = (ctx, isLoading) => {
    const createChart = () => {
        disposeChart(ctx);
        state.chartRegistry[ctx] = am4core.create(ctx, am4charts.PieChart);
        return state.chartRegistry[ctx];
    };

    const chart = createChart();
    state.chart = chart;
    if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
    chart.responsive.enabled = true;
    chart.innerRadius = am4core.percent(62);

    if (isLoading) {
        chart.data = [{
            status: 'Dummy',
            count: 1000,
            color: violet[200],
        }];
    } else {
        chart.data = state.data;
    }

    const series = chart.series.create();
    series.slices.template.togglable = false;
    series.slices.template.clickable = false;
    series.dataFields.value = 'count';
    series.dataFields.category = 'status';
    series.slices.template.propertyFields.fill = 'color';
    series.slices.template.stroke = am4core.color(white);
    series.slices.template.strokeWidth = 2;
    series.slices.template.strokeOpacity = 1;
    series.slices.template.states.getKey('hover').properties.scale = 1;
    series.tooltip.disabled = true;
    series.ticks.template.disabled = true;
    series.labels.template.text = '';

    const label = new am4core.Label();
    label.parent = series;
    label.horizontalCenter = 'middle';
    label.verticalCenter = 'middle';
    label.fontSize = 20;
    label.fontWeight = 'lighter';
    label.fill = am4core.color(gray[900]);
    if (isLoading) label.text = '';
    label.text = '{values.value.sum}';
};

/* api */
const getCurrentProjectStatus = async () => {
    try {
        state.loading = true;
        const { results, total_count } = await SpaceConnector.client.monitoring.dashboard.currentProjectStatus();
        state.count.total = total_count;
        state.count.issue = results.filter((d) => d.is_issued).length;
        state.count.healthy = total_count - state.count.issue;
        // todo: maintenance 향후 추가 예정
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

(async () => {
    await getCurrentProjectStatus();
})();

watch([() => state.loading, () => loaderRef.value, () => chartRef.value], ([loading, loaderCtx, chartCtx]) => {
    if (loading && loaderCtx) {
        drawChart(loaderCtx, true);
    } else if (!loading && chartCtx) {
        drawChart(chartCtx, false);
    }
}, { immediate: true });

</script>

<template>
    <div class="current-project-status-widget">
        <p class="title">
            {{ t('MONITORING.ALERT.DASHBOARD.CURRENT_PROJECT_STATUS') }}
        </p>
        <div class="chart-wrapper">
            <p-data-loader :loading="state.loading">
                <template #loader>
                    <div ref="loaderRef" />
                </template>
                <div ref="chartRef"
                     class="chart"
                />
            </p-data-loader>
            <div class="legend-wrapper">
                <p class="legend">
                    <span>{{ t('MONITORING.ALERT.DASHBOARD.TOTAL') }}</span>
                    <span class="count">{{ state.count.total }}</span>
                </p>
                <p class="legend issue">
                    <span class="circle" />
                    <span class="label">{{ t('MONITORING.ALERT.DASHBOARD.ISSUE') }}</span>
                    <span class="count">{{ state.count.issue }}</span>
                </p>
                <p class="legend maintenance">
                    <span class="circle" />
                    <span class="label">{{ t('MONITORING.ALERT.DASHBOARD.MAINTENANCE') }}</span>
                    <span class="count">{{ state.count.maintenance }}</span>
                </p>
                <p class="legend healthy">
                    <span class="circle" />
                    <span class="label">{{ t('MONITORING.ALERT.DASHBOARD.HEALTHY') }}</span>
                    <span class="count">{{ state.count.healthy }}</span>
                </p>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.current-project-status-widget {
    @apply bg-white border border-gray-200 rounded-md;
    padding: 1rem;

    .title {
        @apply text-gray-900;
        font-size: 1rem;
        line-height: 1.6;
        font-weight: bold;
    }

    .chart-wrapper {
        display: flex;
        padding-top: 1rem;

        .chart {
            width: 6rem;
            height: 6rem;
            margin-left: -0.5rem;
        }

        .legend-wrapper {
            width: 100%;
            font-size: 0.875rem;
            .legend {
                max-width: 10rem;
                line-height: 1.8;
                &.issue {
                    .circle {
                        @apply bg-red-400;
                    }
                    .count {
                        @apply text-red-400;
                    }
                }
                &.maintenance {
                    .circle {
                        @apply bg-yellow-400;
                    }
                }
                &.healthy {
                    .circle {
                        @apply bg-safe;
                    }
                    .count {
                        @apply text-safe;
                    }
                }
                .circle {
                    @apply rounded-full;
                    display: inline-block;
                    width: 0.625rem;
                    height: 0.625rem;
                    margin-right: 0.25rem;
                }
                .label {
                    font-size: 0.75rem;
                }
                .count {
                    float: right;
                }
            }
        }
    }

    .p-data-loader {
        height: 100%;
    }
}
</style>
