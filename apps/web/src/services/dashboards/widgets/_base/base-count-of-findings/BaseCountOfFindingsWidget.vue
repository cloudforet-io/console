<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref,
} from 'vue';

import { percent, array } from '@amcharts/amcharts5';
import type * as am5xy from '@amcharts/amcharts5/xy';
import { PDataLoader, PTextPagination } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { setXYSharedTooltipTextWithRate } from '@/common/composables/amcharts5/xy-chart-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrameNew.vue';
import type { CloudServiceStatsModel } from '@/services/dashboards/widgets/_configs/asset-config';
import { COMPLIANCE_STATUS_MAP } from '@/services/dashboards/widgets/_configs/asset-config';
import type { WidgetEmit, WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { ASSET_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetPagination } from '@/services/dashboards/widgets/_hooks/use-widget-pagination';
// eslint-disable-next-line import/no-cycle
import { useWidget } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';
import countOfPassAndFailFindingsWidgetConfig
    from '@/services/dashboards/widgets/asset-widgets/count-of-pass-and-fail-findings/widget-config';
import type { Legend } from '@/services/dashboards/widgets/type';


interface Data extends CloudServiceStatsModel {
    [groupBy: string]: string | any;
    value: { key: string, value: number }[];
}
interface ChartData {
    [key: string]: number;
    fail_finding_count: number;
    pass_finding_count: number;
}

const DATE_FORMAT = 'YYYY-MM';
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    dateRange: computed<DateRange>(() => ({
        end: dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT),
    })),
});

const { pageSize, thisPage } = useWidgetPagination(widgetState);

const state = reactive({
    loading: true,
    data: null as Data[]|null,
    groupByKey: computed<string|undefined>(() => {
        // NOTE: When a dot(".") is included in the groupBy field, the API return value will only include the portion of the field that appears after the dot.
        // ex. additional_info.service -> service
        if (!state.groupBy) return undefined;
        const dotIndex = state.groupBy.indexOf('.');
        if (dotIndex !== -1) {
            return state.groupBy.slice(dotIndex + 1);
        }
        return state.groupBy;
    }),
    legends: computed<Legend[]>(() => {
        if (state.showPassFindings) {
            return [
                { name: 'pass_finding_count', label: COMPLIANCE_STATUS_MAP.PASS.label, color: COMPLIANCE_STATUS_MAP.PASS.color },
                { name: 'fail_finding_count', label: COMPLIANCE_STATUS_MAP.FAIL.label, color: COMPLIANCE_STATUS_MAP.FAIL.color },
            ];
        }
        return [
            { name: 'fail_finding_count', label: COMPLIANCE_STATUS_MAP.FAIL.label, color: COMPLIANCE_STATUS_MAP.FAIL.color },
        ];
    }),
    chartData: computed(() => refineChartData(state.data)),
    showPassFindings: computed(() => props.widgetConfigId === countOfPassAndFailFindingsWidgetConfig.widget_config_id),
    showNextPage: computed(() => !!state.data?.more),
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCloudServiceStatsAnalyze = getCancellableFetcher<{results: Data[]}>(SpaceConnector.clientV2.inventory.cloudServiceStats.analyze);
const fetchData = async (): Promise<Data[]> => {
    try {
        apiQueryHelper
            .setFilters(widgetState.cloudServiceStatsConsoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' });
        if (pageSize.value) apiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);

        if (state.showPassFindings) {
            apiQueryHelper.addFilter({ k: 'key', v: ['fail_finding_count', 'pass_finding_count'], o: '' });
        } else {
            apiQueryHelper.addFilter({ k: 'key', v: ['fail_finding_count'], o: '' });
        }
        const { status, response } = await fetchCloudServiceStatsAnalyze({
            query: {
                granularity: 'MONTHLY',
                start: widgetState.dateRange.end,
                end: widgetState.dateRange.end,
                group_by: ['key', 'unit', widgetState.groupBy],
                fields: {
                    value: {
                        key: 'value',
                        operator: 'sum',
                    },
                },
                field_group: ['key'],
                sort: [{ key: 'value', desc: false }],
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response.results;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    return [];
};

/* Util */
const refineChartData = (data: Data[]): ChartData[] => {
    if (!data?.length) return [];
    const refinedChartData: ChartData[] = [];
    const referenceMap = Object.values(props.allReferenceTypeInfo ?? {}).find((info) => info.key === state.groupBy)?.referenceMap;
    data.forEach((d) => {
        const fail_finding_count = d.value?.find((v) => v.key === 'fail_finding_count')?.value ?? 0;
        const pass_finding_count = d.value?.find((v) => v.key === 'pass_finding_count')?.value ?? 0;
        const rawValue = d[state.groupByKey];
        let refinedValue = referenceMap ? referenceMap[rawValue]?.label : rawValue; // google_cloud -> Google Cloud
        if (state.groupBy === ASSET_GROUP_BY.REGION) refinedValue = referenceMap?.[rawValue]?.name ?? rawValue;
        refinedChartData.push({
            [state.groupByKey]: refinedValue ?? `no_${state.groupByKey}`,
            fail_finding_count,
            pass_finding_count,
        });
    });
    return refinedChartData;
};
const drawChart = (chartData) => {
    if (!state.groupByKey || !state.legends) return;
    const { chart, xAxis, yAxis } = chartHelper.createXYHorizontalChart();
    yAxis.set('categoryField', state.groupByKey);
    yAxis.data.setAll(cloneDeep(chartData));

    const legend = chartHelper.createLegend({
        nameField: 'name',
        clickTarget: 'none',
    });
    chart.children.push(legend);

    state.legends.forEach((_legend) => {
        const seriesSettings: Partial<am5xy.IXYSeriesSettings> = {
            name: _legend.label,
            valueXField: _legend.name,
            categoryYField: state.groupByKey,
            xAxis,
            yAxis,
            baseAxis: yAxis,
            stacked: true,
            fill: _legend.color,
            stroke: _legend.color,
        };
        const series = chartHelper.createXYColumnSeries(chart, seriesSettings);
        series.columns.template.setAll({
            height: 20,
        });
        series.bullets.push(() => {
            const label = chartHelper.createLabel({
                text: `{${_legend.name}}`,
                populateText: true,
                textAlign: 'end',
                centerY: percent(50),
                fontSize: 14,
            });
            return chartHelper.createBullet({
                locationX: 1,
                locationY: 0.5,
                sprite: label,
                dynamic: true,
            });
        });
        series.columns.template.onPrivate(('width'), (width, target) => {
            array.each(target?.dataItem?.bullets ?? [], (bullet) => {
                if ((width !== undefined) && width < 30) {
                    bullet.get('sprite').hide();
                }
            });
        });
        if (state.showPassFindings) {
            const tooltip = chartHelper.createTooltip();
            setXYSharedTooltipTextWithRate(chart, tooltip);
            series.set('tooltip', tooltip);
        }
        chart.series.push(series);
        series.data.setAll(cloneDeep(chartData));
    });
    legend.data.setAll(chart.series.values);
};
const initWidget = async (data?: Data[]): Promise<Data[]> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};
const refreshWidget = async (_thisPage = 1): Promise<Data[]> => {
    await nextTick();
    state.loading = true;
    thisPage.value = _thisPage;
    state.data = await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const handleUpdateThisPage = (_thisPage: number) => {
    thisPage.value = _thisPage;
    refreshWidget(_thisPage);
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
    emit,
    widgetState,
});
defineExpose<WidgetExpose<Data[]>>({
    initWidget,
    refreshWidget,
});

</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="count-of-findings-widget"
                  v-on="widgetFrameEventHandlers"
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
                <p-text-pagination :this-page="thisPage"
                                   :disable-next-page="!state.showNextPage"
                                   @update:thisPage="handleUpdateThisPage"
                >
                    <template #default>
                        <span class="this-page">{{ thisPage }}</span>
                        <span v-if="state.showNextPage"> / ...</span>
                    </template>
                </p-text-pagination>
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.count-of-findings-widget {
    &.full {
        height: 29rem;
    }
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
        .table-pagination-wrapper {
            flex-shrink: 0;
            text-align: center;
            .this-page {
                font-weight: bold;
            }
        }
    }
}
</style>
