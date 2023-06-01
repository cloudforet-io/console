<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="compliance-check-status"
                  @refresh="refreshWidget"
    >
        <div class="compliance-check-status">
            <div class="data-container">
                <div class="summary-wrapper">
                    <div class="left-wrapper">
                        <p class="title">
                            <!--TODO: translation-->
                            Checked service account
                        </p>
                        <p class="value">
                            <!--TODO: real data-->
                            4
                        </p>
                    </div>
                    <p-divider :vertical="true" />
                    <div class="right-wrapper">
                        <!--TODO: translation-->
                        <p class="title">
                            Total compliance number
                        </p>
                        <p class="value">
                            <!--TODO: real data-->
                            880
                        </p>
                        <div class="diff-wrapper">
                            <p-i name="ic_caret-up-filled"
                                 :color="red[500]"
                            />
                            <span class="diff-value">75</span>
                            <!--TODO: translation-->
                            <span class="diff-text">more than previous 30 days</span>
                        </div>
                    </div>
                </div>
                <div class="chart-wrapper">
                    <p-data-loader class="chart-loader"
                                   :loading="state.loading"
                                   :data="state.chartData"
                                   loader-type="skeleton"
                                   disable-empty-case
                                   :loader-backdrop-opacity="1"
                                   show-data-from-scratch
                    >
                        <div ref="chartContext"
                             class="chart"
                        />
                    </p-data-loader>
                    <div class="legend-wrapper">
                        <div v-for="status in COMPLIANCE_STATUS_MAP_VALUES"
                             :key="`legend-item-${status.name}`"
                             class="legend-item"
                        >
                            <div class="title">
                                <div class="square-mark"
                                     :style="{ backgroundColor: status.color }"
                                />
                                <span class="text">{{ status.label }}</span>
                            </div>
                            <p class="value">
                                345
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import { color, percent } from '@amcharts/amcharts5';
import { PDataLoader, PDivider, PI } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { random } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import type { createPieChart } from '@/common/composables/amcharts5/pie-chart-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { red } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { COMPLIANCE_STATUS_MAP, SEVERITY_STATUS_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';

interface Data {
    budget_type: string;
    budget_count: number;
    limit: number;
    usd_cost: number;
    usage: number;
    pieSettings?: {
        fill: ReturnType<typeof color>
    }
}

interface ChartData {
    status: string;
    rate: number;
    pieSettings?: {
        fill: string
    }
}

const COMPLIANCE_STATUS_MAP_VALUES = Object.values(COMPLIANCE_STATUS_MAP);
const SEVERITY_FAIL_STATUS_MAP_VALUES = Object.values(SEVERITY_STATUS_MAP).filter((status) => status.name !== 'pass');
const DATE_FORMAT = 'YYYY-MM';

const props = defineProps<WidgetProps>();
const chartContext = ref<HTMLElement|null>(null);
const {
    createDonutChart, createPieSeries, setPieLabelText,
    disposeRoot, refreshRoot, root,
} = useAmcharts5(chartContext);
const state = reactive({
    ...toRefs(useWidgetState<Data[]>(props)),
    chart: null as null|ReturnType<typeof createPieChart>,
    series: null as null|ReturnType<typeof createPieSeries>,
    outerChartData: computed<ChartData[]>(() => {
        if (!state.data) return [];
        // TODO: replace with real data
        const randomValue = random(50, 70);
        const results = [
            {
                status: 'pass',
                rate: randomValue,
                pieSettings: {
                    fill: color(COMPLIANCE_STATUS_MAP.PASS.color),
                },
            },
            {
                status: 'fail',
                rate: (100 - randomValue),
                pieSettings: {
                    fill: color(COMPLIANCE_STATUS_MAP.FAIL.color),
                },
            },
        ];
        return results;
    }),
    innerChartData: computed(() => SEVERITY_FAIL_STATUS_MAP_VALUES.map((status) => ({
        status: status.name,
        rate: random(0, 100),
        pieSettings: {
            fill: color(status.color),
        },
    }))),
    dateRange: computed<DateRange>(() => ({
        start: dayjs.utc(state.settings?.date_range?.start).format(DATE_FORMAT),
        end: dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT),
    })),
});

const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
const fetchData = async (): Promise<Data[]> => {
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters(state.budgetConsoleFilters);
        const { results } = await SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze({
            query: {
                granularity: state.options.granularity,
                start: state.dateRange.start,
                end: state.dateRange.end,
                fields: {
                    total_spent: {
                        key: 'usd_cost',
                        operator: 'sum',
                    },
                    total_budget: {
                        key: 'limit',
                        operator: 'sum',
                    },
                    budget_count: {
                        operator: 'count',
                    },
                },
                ...apiQueryHelper.data,
            },
        });
        return results;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

/* Util */
const drawChart = (outerChartData, innerChartData) => {
    const chart = createDonutChart({
        radius: percent(100),
        innerRadius: percent(80),
        paddingTop: 30,
    });

    // outer
    const outerSeriesSettings = {
        categoryField: 'status',
        valueField: 'rate',
        startAngle: 160,
        endAngle: 380,
        radius: percent(250),
        innerRadius: percent(150),
    };
    const outerSeries = createPieSeries(outerSeriesSettings);
    chart.series.push(outerSeries);
    outerSeries.labels.template.set('forceHidden', true);
    outerSeries.ticks.template.set('visible', false);
    outerSeries.slices.template.setAll({
        toggleKey: 'none',
        forceInactive: true,
        templateField: 'pieSettings',
        strokeOpacity: 0,
    });
    outerSeries.data.setAll(outerChartData);

    // inner
    const innerSeriesSettings = {
        categoryField: 'status',
        valueField: 'rate',
        startAngle: 160,
        endAngle: 380,
        radius: percent(100),
        innerRadius: percent(70),
    };
    const innerSeries = createPieSeries(innerSeriesSettings);
    chart.series.push(innerSeries);
    innerSeries.labels.template.set('forceHidden', true);
    innerSeries.ticks.template.set('visible', false);
    innerSeries.slices.template.setAll({
        toggleKey: 'none',
        forceInactive: true,
        templateField: 'pieSettings',
        strokeOpacity: 0,
    });

    // TODO: replace with real data
    setPieLabelText(chart, { text: '[fontSize:16px]Compliance score[/]:\n[fontSize:32px]45[/]' });
    innerSeries.data.setAll(innerChartData);
};

const initWidget = async (data?: Data[]): Promise<Data[]> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (root.value) drawChart(state.outerChartData, state.innerChartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (): Promise<Data[]> => {
    await nextTick();
    state.loading = true;
    state.data = await fetchData();
    refreshRoot();
    await nextTick();
    if (root.value) drawChart(state.outerChartData, state.innerChartData);
    state.loading = false;
    return state.data;
};

useWidgetLifecycle({
    disposeWidget: disposeRoot,
    refreshWidget,
    props,
    state,
});

defineExpose<WidgetExpose<Data[]>>({
    initWidget,
    refreshWidget,
});

</script>
<style lang="postcss" scoped>
.compliance-check-status {
    .data-container {
        .summary-wrapper {
            display: flex;
            justify-content: space-between;
            margin: 0;
            padding-bottom: 1rem;
            .left-wrapper, .right-wrapper {
                width: 50%;
                flex: 1 1 auto;
                position: relative;
                padding: 0.375rem 1.5rem;
                .title {
                    padding-bottom: 0.25rem;
                }
                .value {
                    @apply text-display-md;
                }
                .diff-wrapper {
                    @apply text-gray-700;
                    .diff-value {
                        @apply text-label-lg;
                        padding-right: 0.25rem;
                    }
                    .diff-text {
                        @apply text-label-sm;
                    }
                }
            }
            .left-wrapper {
                padding-right: 2rem;
            }
            .right-wrapper {
                padding-left: 2rem;
            }
        }
        .chart-wrapper {
            @apply relative grid-cols-12;
            display: grid;
            gap: 1.5rem;
            height: 15rem;
            padding-bottom: 2rem;
            .chart-loader {
                @apply col-span-8;
                .chart {
                    height: 100%;
                }
            }
            .legend-wrapper {
                @apply col-span-4;
                .legend-item {
                    &:first-child {
                        padding-bottom: 1.5rem;
                    }
                    .title {
                        @apply text-label-lg;
                        display: flex;
                        align-items: center;
                        gap: 0.25rem;
                        .square-mark {
                            width: 0.75rem;
                            height: 0.75rem;
                            padding-right: 0.25rem;
                        }
                    }
                    .value {
                        @apply text-display-md;
                    }
                }
            }
        }
    }
}
</style>
