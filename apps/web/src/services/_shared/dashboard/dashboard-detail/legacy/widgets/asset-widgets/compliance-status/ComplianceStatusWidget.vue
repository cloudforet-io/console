<script setup lang="ts">
import {
    computed, defineProps, nextTick, reactive, ref,
} from 'vue';

import { color, percent } from '@amcharts/amcharts5';
import type { Color } from '@amcharts/amcharts5/.internal/core/util/Color';
import { isEmpty, sum } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PDataLoader, PTooltip, PI } from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { CloudServiceAnalyzeParameters } from '@/schema/inventory/cloud-service/api-verbs/analyze';
import { i18n } from '@/translations';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import WidgetFrame from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import { useWidgetLifecycle } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-lifecycle';
import { useWidget } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import {
    COMPLIANCE_STATUS_MAP, SEVERITY_STATUS_MAP,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_constants/compliance-constant';
import type { Severity } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/compliance-type';
import type { WidgetExpose, WidgetProps, WidgetEmit } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';


interface SubData {
    severity: Severity;
    value: number;
}
interface Data {
    status: 'PASS'|'FAIL';
    compliance_count: SubData[];
    pass_score: SubData[];
    fail_score: SubData[];
    _total_compliance_count: number;
    _total_pass_score: number;
    _total_fail_score: number;
    date: string;
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
const SEVERITY_STATUS_MAP_VALUES = Object.values(SEVERITY_STATUS_MAP);

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit);
const state = reactive({
    loading: true,
    data: null as Data[]|null,
    noData: computed(() => !state.data?.length),
    outerChartData: computed<OuterChartData[]>(() => COMPLIANCE_STATUS_MAP_VALUES.map((status) => ({
        status: status.label,
        value: state.complianceCountMap?.[status.name],
        pieSettings: {
            fill: color(status.color),
            stroke: color(status.color),
        },
    }))),
    innerChartData: computed<InnerChartData[]>(() => {
        const targetStatusData: Data['compliance_count'] = state.data?.find((d) => d.status === 'FAIL')?.compliance_count;
        if (isEmpty(targetStatusData)) return [];
        const innerChartData: InnerChartData[] = [];
        SEVERITY_STATUS_MAP_VALUES.forEach((severity) => {
            const severityData = targetStatusData.find((d) => d.severity === severity.name);
            if (!severityData) return;
            innerChartData.push({
                severity: severity.label,
                value: severityData.value,
                pieSettings: {
                    fill: color(severity.color),
                    stroke: color(severity.color),
                },
            });
        });
        return innerChartData;
    }),
    innerChartTooltipText: computed<string>(() => {
        if (!state.innerChartData?.length) return '';
        let text = '';
        const totalFailCheckCount = sum(state.innerChartData.map((d) => d.value));
        state.innerChartData.forEach((d, idx) => {
            const failRate = Math.round((d.value / totalFailCheckCount) * 100);
            if (idx !== 0) text += '\n';
            text += `[${d.pieSettings?.fill.toString()}; fontSize: 14px]●[/] Fail (${d.severity}): ${failRate}%`;
        });
        return text;
    }),
    complianceCount: computed<number>(() => sum(Object.values(state.complianceCountMap))),
    complianceCountMap: computed<Record<string, number>>(() => {
        if (!state.data) return {} as Record<string, number>;
        const passComplianceCount = sum(state.data.filter((d) => d.status === 'PASS').map((d) => d._total_compliance_count));
        const failComplianceCount = sum(state.data.filter((d) => d.status === 'FAIL').map((d) => d._total_compliance_count));
        return {
            [COMPLIANCE_STATUS_MAP.PASS.name]: passComplianceCount,
            [COMPLIANCE_STATUS_MAP.FAIL.name]: failComplianceCount,
        };
    }),
    score: computed<number|undefined>(() => {
        if (!state.data) return undefined;
        const passScore = sum(state.data.map((d) => d._total_pass_score)) ?? 0;
        const failScore = sum(state.data.map((d) => d._total_fail_score)) ?? 0;
        const totalScore = passScore + failScore;
        if (totalScore === 0) return 0;
        return Math.round((passScore / totalScore) * 100);
    }),
    tooltipText: computed<string>(() => {
        let text: string = i18n.t('DASHBOARDS.WIDGET.COMPLIANCE_STATUS.COMPLIANCE_SCORE_TOOLTIP') as string;
        Object.values(SEVERITY_STATUS_MAP).forEach((severity) => {
            if (severity.level) text += `<br>· ${severity.label}: ${severity.level}`;
        });
        return text;
    }),
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCloudServiceAnalyze = getCancellableFetcher<CloudServiceAnalyzeParameters, {results: Data[]}>(SpaceConnector.clientV2.inventory.cloudService.analyze);
const fetchData = async (): Promise<Data[]> => {
    try {
        apiQueryHelper
            .setFilters(widgetState.consoleFilters)
            .addFilter({ k: 'data.status', v: ['PASS', 'FAIL'], o: '=' });
        const { status, response } = await fetchCloudServiceAnalyze({
            query: {
                group_by: ['data.status', 'data.severity'],
                fields: {
                    compliance_count: {
                        operator: 'count',
                    },
                    pass_score: {
                        key: 'data.stats.score.pass',
                        operator: 'sum',
                    },
                    fail_score: {
                        key: 'data.stats.score.fail',
                        operator: 'sum',
                    },
                },
                field_group: ['severity'],
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            return response.results;
        }
        return state.data;
    } catch (e: any) {
        ErrorHandler.handleError(e);
        return [];
    }
};

/* Util */
const drawChart = (outerChartData: OuterChartData[], innerChartData: InnerChartData[]) => {
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
    const innerTooltip = chartHelper.createTooltip({
        labelText: state.innerChartTooltipText,
    });
    innerSeries.slices.template.set('tooltip', innerTooltip);
    innerSeries.data.setAll(innerChartData);

    if (!state.noData) {
        chartHelper.setPieLabelText(chart, { text: `[fontSize:16px]Compliance Score[/]:\n[fontSize:32px]${state.score}[/]` });
    }
};

const initWidget = async (data?: Data[]): Promise<Data[]> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (chartHelper.root.value) {
        chartHelper.clearChildrenOfRoot();
        drawChart(state.outerChartData, state.innerChartData);
    }
    state.loading = false;
    return state.data;
};

const refreshWidget = async (): Promise<Data[]> => {
    await nextTick();
    state.loading = true;
    state.data = await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) {
        chartHelper.clearChildrenOfRoot();
        drawChart(state.outerChartData, state.innerChartData);
    }
    state.loading = false;
    return state.data;
};

const redrawChart = () => {
    if (chartHelper.root.value) {
        chartHelper.clearChildrenOfRoot();
        drawChart(state.outerChartData, state.innerChartData);
    }
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    initWidget,
    refreshWidget,
    props,
    emit,
    widgetState,
    onLanguageUpdate: redrawChart,
});

defineExpose<WidgetExpose<Data[]>>({
    initWidget,
    refreshWidget,
});

</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="compliance-check-status"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="compliance-check-status">
            <div class="data-container">
                <div class="summary-wrapper">
                    <div class="right-wrapper">
                        <p class="title">
                            Total number of requirements
                        </p>
                        <p class="value">
                            {{ numberFormatter(state.complianceCount) }}
                        </p>
                    </div>
                </div>
                <div class="chart-wrapper">
                    <p-data-loader class="chart-loader"
                                   :loading="props.loading || state.loading"
                                   :data="state.data"
                                   loader-type="skeleton"
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
                                {{ numberFormatter(state.complianceCountMap[status.name] ?? 0) }}
                            </p>
                        </div>
                        <div class="tooltip-wrapper">
                            <p-tooltip :contents="state.tooltipText"
                                       position="bottom"
                            >
                                <span>{{ $t('DASHBOARDS.WIDGET.COMPLIANCE_STATUS.COMPLIANCE_SCORE') }}</span>
                                <p-i name="ic_info-circle"
                                     width="1rem"
                                     height="1rem"
                                     color="inherit"
                                     class="tooltip-icon"
                                />
                            </p-tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.compliance-check-status {
    .data-container {
        .summary-wrapper {
            display: flex;
            justify-content: space-between;
            margin: 0;
            padding-bottom: 2rem;
            min-height: 7.375rem;
            .left-wrapper, .right-wrapper {
                flex: 1 1 auto;
                position: relative;
                padding: 0.375rem 1.5rem;
                .title {
                    padding-bottom: 0.25rem;
                }
                .value {
                    @apply text-display-md;
                }
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
                .tooltip-wrapper {
                    padding-top: 1.5rem;
                    .tooltip-icon {
                        margin-left: 0.25rem;
                    }
                }
            }
        }
    }
}
</style>
