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

import type { ReferenceMap } from '@/store/modules/reference/type';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { setXYSharedTooltipTextWithRate } from '@/common/composables/amcharts5/xy-chart-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import WidgetChartNoDataOverlay from '@/services/dashboards/widgets/_components/WidgetChartNoDataOverlay.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrameNew.vue';
import type { CloudServiceStatsModel } from '@/services/dashboards/widgets/_configs/asset-config';
import { COMPLIANCE_STATUS_MAP } from '@/services/dashboards/widgets/_configs/asset-config';
import type { WidgetEmit, WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { ASSET_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
import { useWidgetPagination } from '@/services/dashboards/widgets/_hooks/use-widget-pagination';
// eslint-disable-next-line import/no-cycle
import { useWidget } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';
import countOfPassAndFailFindingsWidgetConfig
    from '@/services/dashboards/widgets/asset-widgets/count-of-pass-and-fail-findings/widget-config';
import type { Legend } from '@/services/dashboards/widgets/type';


interface Data extends CloudServiceStatsModel {
    [groupBy: string]: string | null | any;
    value: { key: string, value: number }[];
}
interface ChartData {
    [key: string]: string | number;
    fail_finding_count: number;
    pass_finding_count: number;
}

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    dateRange: computed(() => ({
        start: dayjs(widgetState.settings?.date_range?.start).format('YYYY-MM-DD'),
        end: dayjs(widgetState.settings?.date_range?.end).format('YYYY-MM'),
    })),
});

const { pageSize, thisPage } = useWidgetPagination(widgetState);

const state = reactive({
    loading: true,
    data: null as Data[]|null,
    groupByKey: computed<string|undefined>(() => {
        // NOTE: When a dot(".") is included in the groupBy field, the API return value will only include the portion of the field that appears after the dot.
        // ex. additional_info.service -> service
        if (!widgetState.groupBy) return undefined;
        const dotIndex = widgetState.groupBy.indexOf('.');
        if (dotIndex !== -1) {
            return widgetState.groupBy.slice(dotIndex + 1);
        }
        return widgetState.groupBy;
    }),
    groupByReferenceMap: computed<ReferenceMap>(() => {
        if (!state.groupByKey || !props.allReferenceTypeInfo) return {};
        return Object.values(props.allReferenceTypeInfo).find((info) => info.key === state.groupByKey)?.referenceMap ?? {};
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
    noData: computed(() => !state.data?.length),
    chartData: computed<ChartData[]>(() => refineChartData(state.data, state.groupByKey, state.groupByReferenceMap)),
    showPassFindings: computed(() => props.widgetConfigId === countOfPassAndFailFindingsWidgetConfig.widget_config_id),
    showNextPage: computed(() => !!state.data?.more),
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCloudServiceStatsAnalyze = getCancellableFetcher<{results: Data[]}>(SpaceConnector.clientV2.inventory.cloudServiceStats.analyze);
const fetchData = async (): Promise<Data[]> => {
    try {
        state.loading = true;

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
        if (status === 'succeed') {
            state.loading = false;
            return response.results;
        }
        return state.data;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.loading = false;
        return [];
    }
};

/* Util */
const refineChartData = (data: Data[], groupByKey: string|undefined, referenceMap: ReferenceMap): ChartData[] => {
    if (!data?.length || !groupByKey) return [];

    const refinedChartData: ChartData[] = [];
    data.forEach((d) => {
        const fail_finding_count = d.value?.find((v) => v.key === 'fail_finding_count')?.value ?? 0;
        const pass_finding_count = d.value?.find((v) => v.key === 'pass_finding_count')?.value ?? 0;

        const rawValue = d[groupByKey];
        let refinedValue: string|null|undefined;

        // google_cloud -> Google Cloud
        if (groupByKey === ASSET_GROUP_BY.REGION) refinedValue = referenceMap[rawValue]?.name ?? rawValue;
        else refinedValue = referenceMap[rawValue]?.label ?? rawValue;

        refinedChartData.push({
            [groupByKey]: refinedValue ?? `no_${groupByKey}`,
            fail_finding_count,
            pass_finding_count,
        });
    });
    return refinedChartData;
};
const drawChart = (chartData: ChartData[]) => {
    if (!state.groupByKey) {
        console.error(new Error('groupByKey is undefined'));
        return;
    }

    // create chart and axis
    const { chart, xAxis, yAxis } = chartHelper.createXYHorizontalChart();
    yAxis.set('categoryField', state.groupByKey);
    yAxis.data.setAll(cloneDeep(chartData));

    // create legends
    const legends = chartHelper.createLegend({
        nameField: 'name',
        clickTarget: 'none',
    });

    // add legends to chart
    chart.children.push(legends);

    // set series for each legend
    state.legends.forEach((legend: Legend) => {
        const seriesSettings: Partial<am5xy.IXYSeriesSettings> = {
            name: legend.label as string,
            valueXField: legend.name,
            categoryYField: state.groupByKey,
            xAxis,
            yAxis,
            baseAxis: yAxis,
            stacked: true,
            fill: chartHelper.color(legend.color as string),
            stroke: chartHelper.color(legend.color as string),
            opacity: state.noData ? 0 : 1,
        };

        // create series
        const series = chartHelper.createXYColumnSeries(chart, seriesSettings);

        // add bullets to series
        series.bullets.clear();
        series.bullets.push(() => {
            const label = chartHelper.createLabel({
                text: `{${legend.name}}`,
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

        // set series style
        series.columns.template.setAll({
            height: 20,
        });
        series.columns.template.onPrivate(('width'), (width, target) => {
            array.each(target?.dataItem?.bullets ?? [], (bullet) => {
                if ((width !== undefined) && width < 30) {
                    bullet.get('sprite').hide();
                }
            });
        });

        // set tooltip if showPassFindings is true
        if (state.showPassFindings) {
            const tooltip = chartHelper.createTooltip();
            setXYSharedTooltipTextWithRate(chart, tooltip);
            series.set('tooltip', tooltip);
        }

        // add series to chart
        chart.series.push(series);

        // set data to series
        const data: ChartData[] = state.noData ? [
            { fail_finding_count: 90, pass_finding_count: 0 },
        ] : cloneDeep(chartData);
        series.data.setAll(data);
    });



    // set series values to legends data
    legends.data.setAll(chart.series.values);
};
const initWidget = async (data?: Data[]): Promise<Data[]> => {
    state.data = data ?? await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    return state.data;
};
const refreshWidget = async (_thisPage = 1): Promise<Data[]> => {
    thisPage.value = _thisPage;
    state.data = await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
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
                               disable-empty-case
                >
                    <div ref="chartContext"
                         class="chart"
                    />
                    <widget-chart-no-data-overlay v-if="state.noData && !state.loading" />
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
