<script lang="ts" setup>

import type { PieChart } from '@amcharts/amcharts4/charts';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import config from '@/lib/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { green, red, yellow } from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import type { ExtraParams } from '@/services/home-dashboard/modules/type';

const CLOUD_SERVICE_GROUP = 'TrustedAdvisor';
const CLOUD_SERVICE_NAME = 'Check';
const STATUS = Object.freeze({
    ERROR: 'error',
    WARNING: 'warning',
    OK: 'ok',
} as const);
const STATUS_COLORS = Object.freeze({
    [STATUS.ERROR]: red[500],
    [STATUS.WARNING]: yellow[500],
    [STATUS.OK]: green[600],
});
type Status = typeof STATUS[keyof typeof STATUS];
interface OverallData {
    status: Status;
    count: number;
}

interface Props {
    extraParams: ExtraParams;
}

const props = withDefaults(defineProps<Props>(), {
    extraParams: () => ({}),
});
const { t } = useI18n();

const queryHelper = new QueryHelper();
const state = reactive({
    loading: true,
    chart: null as null | PieChart,
    chartRef: null as HTMLElement | null,
    chartData: [] as OverallData[],
    legendData: computed(() => ({
        [STATUS.ERROR]: {
            name: STATUS.ERROR,
            label: t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_ERROR'),
            color: STATUS_COLORS[STATUS.ERROR],
            count: state.chartData.find((d) => d.status === STATUS.ERROR)?.count,
        },
        [STATUS.WARNING]: {
            name: STATUS.WARNING,
            label: t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_WARNING'),
            color: STATUS_COLORS[STATUS.WARNING],
            count: state.chartData.find((d) => d.status === STATUS.WARNING)?.count,
        },
        [STATUS.OK]: {
            name: STATUS.OK,
            label: t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_OK'),
            color: STATUS_COLORS[STATUS.OK],
            count: state.chartData.find((d) => d.status === STATUS.OK)?.count,
        },
    })),
});

/* Util */
const overallLinkFormatter = (status) => {
    const filters: ConsoleFilter[] = [];
    filters.push({ k: 'data.status', o: '=', v: status });

    return {
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
        query: {
            filters: queryHelper.setFilters(filters).rawQueryStrings,
        },
        params: {
            provider: 'aws',
            group: CLOUD_SERVICE_GROUP,
            name: CLOUD_SERVICE_NAME,
        },
    };
};
const drawChart = (chartContext) => {
    const chart = am4core.create(chartContext, am4charts.PieChart);
    if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
    chart.paddingTop = 12;
    chart.responsive.enabled = true;
    chart.data = state.chartData;

    const series = chart.series.push(new am4charts.PieSeries());
    series.labels.template.disabled = true;
    series.ticks.template.disabled = true;
    series.dataFields.value = 'count';
    series.dataFields.category = 'status';

    const slice: any = series.slices.template;
    slice.togglable = false;
    slice.clickable = false;
    slice.stroke = am4core.color('#fff');
    slice.tooltipText = '';
    slice.strokeWidth = 1;
    slice.states.getKey('hover').properties.scale = 1;
    slice.adapter.add('fill', (fill, target) => {
        if (target.dataItem) return am4core.color(STATUS_COLORS[target.dataItem.category]);
        return fill;
    });

    // animation
    series.hiddenState.properties.opacity = 1;
    series.hiddenState.properties.endAngle = -90;
    series.hiddenState.properties.startAngle = -90;

    state.chart = chart;
};

/* Api */
const getOverallData = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.client.statistics.topic.trustedAdvisorSummary(props.extraParams);
        state.chartData = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.chartData = [];
    } finally {
        state.loading = false;
    }
};

/* Init */
(async () => {
    await getOverallData();
})();

/* Watcher */
watch([() => state.loading, () => state.chartRef], async ([loading, chartContext]) => {
    if (!loading && chartContext) {
        drawChart(chartContext);
    }
}, { immediate: true });

onUnmounted(() => {
    if (state.chart) state.chart.dispose();
});

</script>

<template>
    <div class="trusted-advisor-overall">
        <div class="title">
            <span class="text">{{ t('COMMON.WIDGETS.TRUSTED_ADVISOR.SUB_TITLE_OVERALL') }}</span>
        </div>
        <div class="chart-wrapper">
            <div ref="chartRef"
                 class="chart"
            />
        </div>
        <div class="legend-wrapper">
            <template v-for="([k, v]) of Object.entries(legendData)"
                      :key="k"
            >
                <router-link
                    :to="overallLinkFormatter(v.name)"
                    class="legend-row"
                    :class="v.name"
                >
                    <div class="left-part">
                        <span class="legend-circle"
                              :style="{ 'background-color': v.color }"
                        />
                        <span class="legend-text"
                              :class="v.name"
                        >{{ v.label }}</span>
                    </div>
                    <div class="right-part relative lg:absolute">
                        <span :style="{ 'color': v.color }">{{ v.count }}</span>
                    </div>
                </router-link>
            </template>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.trusted-advisor-overall {
    @apply col-span-3 grid grid-cols-12;

    @screen mobile {
        @apply col-span-12;
    }
    .title {
        @apply col-span-12;
        font-size: 1rem;
        line-height: 1.6;
        .text {
            @apply font-bold;
        }
    }
    .chart-wrapper {
        @apply col-span-12;

        @screen mobile {
            @apply col-span-4;
            height: 6rem;
        }
        .chart {
            width: 100%;
            height: 100%;
        }
    }
    .legend-wrapper {
        @apply col-span-12;

        @screen mobile {
            @apply col-span-8;
        }
        .legend-row {
            position: relative;
            display: flex;
            align-items: center;
            height: 1.75rem;
            font-size: 0.875rem;
            cursor: pointer;
            padding: 0.25rem 0;
            &:hover {
                @apply bg-secondary2;
                .legend-text {
                    text-decoration: underline;
                    &.error {
                        @apply text-red-500;
                    }
                    &.warning {
                        @apply text-yellow-500;
                    }
                    &.ok {
                        @apply text-green-600;
                    }
                }
                .right-part {
                    text-decoration: underline;
                }
            }
            &.error {
                @apply text-red-500;
            }
            &.warning {
                @apply text-yellow-500;
            }
            &.ok {
                @apply text-green-600;
            }
            .left-part {
                display: inline-flex;
                width: 90%;
                .legend-circle {
                    @apply rounded-full;
                    display: inline-block;
                    width: 0.5rem;
                    height: 0.5rem;
                    margin: auto 0.25rem auto 0;
                }
                .legend-text {
                    @apply text-gray-700;
                    display: inline-block;
                    line-height: 1.4;
                    width: 95%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
            .right-part {
                position: absolute;
                right: 0;
                vertical-align: text-bottom;
            }
        }
    }
}
</style>
