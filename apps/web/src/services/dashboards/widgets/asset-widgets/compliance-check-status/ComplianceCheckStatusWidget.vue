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
                            {{ $t('DASHBOARDS.WIDGET.COMPLIANCE_CHECK_STATUS.CHECKED_SERVICE_ACCOUNT') }}
                        </p>
                        <p class="value">
                            {{ state.accountCount }}
                        </p>
                    </div>
                    <p-divider :vertical="true" />
                    <div class="right-wrapper">
                        <p class="title">
                            {{ $t('DASHBOARDS.WIDGET.COMPLIANCE_CHECK_STATUS.TOTAL_COMPLIANCE_NUMBER') }}
                        </p>
                        <p class="value">
                            {{ state.complianceCount }}
                        </p>
                        <div class="diff-wrapper">
                            <p-i name="ic_caret-up-filled"
                                 :color="red[500]"
                            />
                            <!--TODO: real data-->
                            <span class="diff-value">75</span>
                            <span class="diff-text">{{ $t('DASHBOARDS.WIDGET.COMPLIANCE_CHECK_STATUS.MORE_THAN_PREV_30_DAYS') }}</span>
                        </div>
                    </div>
                </div>
                <div class="chart-wrapper">
                    <p-data-loader class="chart-loader"
                                   :loading="state.loading"
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
                                {{ state.checkCount[status.name] }}
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
import type { Color } from '@amcharts/amcharts5/.internal/core/util/Color';
import { PDataLoader, PDivider, PI } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import type { createPieChart } from '@/common/composables/amcharts5/pie-chart-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { red } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import { COMPLIANCE_STATUS_MAP, SEVERITY_STATUS_MAP } from '@/services/dashboards/widgets/_configs/asset-config';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';


interface ComplianceData {
    compliance_count?: number;
    fail_check_count?: number;
    pass_check_count?: number;
    account_count?: number;
    score?: number;
}
interface SeverityData {
    severity?: string;
    fail_finding_count?: number;
}
interface Data {
    compliance?: ComplianceData;
    severity?: SeverityData;
}

interface OuterChartData {
    status: string;
    value: number;
    pieSettings?: {
        fill?: Color;
        stroke?: Color;
    }
}
interface InnerChartData {
    severity: string;
    value: number;
    pieSettings?: {
        fill?: Color;
        stroke?: Color;
    }
}

const COMPLIANCE_STATUS_MAP_VALUES = Object.values(COMPLIANCE_STATUS_MAP);
const SEVERITY_FAIL_STATUS_MAP_VALUES = Object.values(SEVERITY_STATUS_MAP).filter((status) => status.name !== 'PASS');
const DATE_FORMAT = 'YYYY-MM';

const props = defineProps<WidgetProps>();
const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const state = reactive({
    ...toRefs(useWidgetState<Data>(props)),
    chart: null as null|ReturnType<typeof createPieChart>,
    dateRange: computed<DateRange>(() => ({
        start: dayjs.utc(state.settings?.date_range?.start).format(DATE_FORMAT),
        end: dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT),
    })),
    complianceData: computed<ComplianceData>(() => state.data?.compliance ?? {}),
    severityData: computed<SeverityData[]>(() => state.data?.severity ?? []),
    outerChartData: computed<OuterChartData[]>(() => COMPLIANCE_STATUS_MAP_VALUES.map((status) => ({
        status: status.label,
        value: state.checkCount[status.name],
        pieSettings: {
            fill: color(status.color),
            stroke: color(status.color),
        },
    }))),
    innerChartData: computed<InnerChartData[]>(() => SEVERITY_FAIL_STATUS_MAP_VALUES.map((status) => ({
        severity: status.label,
        value: state.severityData.find((data) => data.severity === status.name)?.fail_finding_count ?? 0,
        pieSettings: {
            fill: color(status.color),
            stroke: color(status.color),
        },
    }))),
    //
    accountCount: computed(() => state.complianceData?.account_count ?? 0),
    complianceCount: computed(() => state.complianceData?.compliance_count ?? 0),
    checkCount: computed(() => ({
        [COMPLIANCE_STATUS_MAP.PASS.name]: state.complianceData?.pass_check_count ?? 0,
        [COMPLIANCE_STATUS_MAP.FAIL.name]: state.complianceData?.fail_check_count ?? 0,
    })),
    score: computed(() => Math.round(state.complianceData?.score ?? 0)),
});

const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
const fetchComplianceData = async (): Promise<ComplianceData> => {
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters(state.consoleFilters);
        const { results } = await SpaceConnector.clientV2.inventory.cloudService.analyze({
            query: {
                fields: {
                    compliance_count: {
                        operator: 'count',
                    },
                    pass_check_count: {
                        key: 'data.stats.checks.pass',
                        operator: 'sum',
                    },
                    fail_check_count: {
                        key: 'data.stats.checks.fail',
                        operator: 'sum',
                    },
                    pass_score: {
                        key: 'data.stats.score.pass',
                        operator: 'sum',
                    },
                    total_score: {
                        key: 'data.stats.score.total',
                        operator: 'sum',
                    },
                    accounts: {
                        key: 'account',
                        operator: 'add_to_set',
                    },
                },
                select: {
                    compliance_count: 'compliance_count',
                    pass_check_count: 'pass_check_count',
                    fail_check_count: 'fail_check_count',
                    account_count: {
                        key: 'accounts',
                        operator: 'size',
                    },
                    score: {
                        operator: 'multiply',
                        fields: [
                            {
                                operator: 'divide',
                                fields: [
                                    'pass_score',
                                    'total_score',
                                ],
                            },
                            100,
                        ],
                    },
                },
                ...apiQueryHelper.data,
            },
        });
        if (results?.length) return results[0];
        return {};
    } catch (e) {
        ErrorHandler.handleError(e);
        return {};
    }
};
const fetchSeverityData = async (): Promise<SeverityData[]> => {
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters(state.consoleFilters);
        const { results } = await SpaceConnector.clientV2.inventory.cloudService.analyze({
            query: {
                group_by: ['data.severity'],
                fields: {
                    fail_finding_count: {
                        key: 'data.stats.checks.fail',
                        operator: 'sum',
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
    const chart = chartHelper.createDonutChart({
        radius: percent(100),
        innerRadius: percent(80),
        paddingTop: 30,
    });

    // outer
    const outerSeriesSettings = {
        categoryField: 'status',
        valueField: 'value',
        startAngle: 160,
        endAngle: 380,
        radius: percent(250),
        innerRadius: percent(150),
    };
    const outerSeries = chartHelper.createPieSeries(outerSeriesSettings);
    outerSeries.labels.template.set('forceHidden', true);
    outerSeries.ticks.template.set('forceHidden', true);
    chart.series.push(outerSeries);
    outerSeries.slices.template.setAll({
        templateField: 'pieSettings',
        strokeOpacity: 0,
    });
    const outerTooltip = chartHelper.createTooltip();
    chartHelper.setPieTooltipText(outerSeries, outerTooltip);
    outerSeries.slices.template.set('tooltip', outerTooltip);
    outerSeries.data.setAll(outerChartData);

    // inner
    const innerSeriesSettings = {
        categoryField: 'severity',
        valueField: 'value',
        startAngle: 160,
        endAngle: 380,
        radius: percent(100),
        innerRadius: percent(70),
    };
    const innerSeries = chartHelper.createPieSeries(innerSeriesSettings);
    chart.series.push(innerSeries);
    innerSeries.labels.template.set('forceHidden', true);
    innerSeries.ticks.template.set('visible', false);
    innerSeries.slices.template.setAll({
        templateField: 'pieSettings',
        strokeOpacity: 0,
    });
    const innerTooltip = chartHelper.createTooltip();
    chartHelper.setPieTooltipText(innerSeries, innerTooltip);
    innerSeries.slices.template.set('tooltip', innerTooltip);
    innerSeries.data.setAll(innerChartData);

    chartHelper.setPieLabelText(chart, { text: `[fontSize:16px]${i18n.t('DASHBOARDS.WIDGET.COMPLIANCE_CHECK_STATUS.COMPLIANCE_SCORE')}[/]:\n[fontSize:32px]${state.score}[/]` });
};

const initWidget = async (data?: Data): Promise<Data> => {
    state.loading = true;
    if (data) {
        state.complianceData = data.compliance;
        state.severityData = data.severity;
    } else {
        const [complianceData, severityData] = await Promise.all([
            fetchComplianceData(),
            fetchSeverityData(),
        ]);
        state.data = {
            compliance: complianceData,
            severity: severityData,
        };
    }
    await nextTick();
    if (chartHelper.root.value) drawChart(state.outerChartData, state.innerChartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (): Promise<Data> => {
    await nextTick();
    state.loading = true;
    const [complianceData, severityData] = await Promise.all([
        fetchComplianceData(),
        fetchSeverityData(),
    ]);
    state.data = {
        compliance: complianceData,
        severity: severityData,
    };
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.outerChartData, state.innerChartData);
    state.loading = false;
    return state.data;
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
    state,
});

defineExpose<WidgetExpose<Data>>({
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
            padding-bottom: 2rem;
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
            padding-bottom: 1rem;
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
