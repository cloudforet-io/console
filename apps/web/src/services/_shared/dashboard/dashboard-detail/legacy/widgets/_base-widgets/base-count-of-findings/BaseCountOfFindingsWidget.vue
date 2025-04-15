<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref,
} from 'vue';

import { percent, array } from '@amcharts/amcharts5';
import type * as am5xy from '@amcharts/amcharts5/xy';
import { cloneDeep } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PDataLoader, PTextPagination } from '@cloudforet/mirinae';

import { ASSET_DATA_FIELD_MAP } from '@/api-clients/dashboard/_constants/widget-constant';
import type { CloudServiceAnalyzeParameters } from '@/schema/inventory/cloud-service/api-verbs/analyze';

import type { ReferenceMap } from '@/store/reference/type';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { setXYSharedTooltipTextWithRate } from '@/common/composables/amcharts5/xy-chart-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import WidgetChartNoDataOverlay from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetChartNoDataOverlay.vue';
import WidgetFrame from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import { useWidgetLifecycle } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-lifecycle';
import { useWidgetPagination } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-pagination';
import { useWidget } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import { COMPLIANCE_STATUS_MAP } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_constants/compliance-constant';
import type {
    WidgetEmit, WidgetExpose, WidgetProps, Legend,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';
import countOfPassAndFailFindingsWidgetConfig
    from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/asset-widgets/count-of-pass-and-fail-findings/widget-config';


interface Data {
    [parsedDataField: string]: string | null | any;
    pass_finding_count: number;
    fail_finding_count: number;
    date: string;
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

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit);

const { pageSize, thisPage } = useWidgetPagination(widgetState);

const state = reactive({
    loading: true,
    data: null as Data[]|null,
    dataFieldReferenceMap: computed<ReferenceMap>(() => {
        if (!widgetState.dataField || !props.allReferenceTypeInfo) return {};
        return Object.values(props.allReferenceTypeInfo).find((info) => info.key === widgetState.dataField)?.referenceMap ?? {};
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
    chartData: computed<ChartData[]>(() => refineChartData(state.data, widgetState.parsedDataField, state.dataFieldReferenceMap)),
    showPassFindings: computed(() => props.widgetConfigId === countOfPassAndFailFindingsWidgetConfig.widget_config_id),
    showNextPage: computed(() => !!state.data?.more),
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCloudServiceAnalyze = getCancellableFetcher<CloudServiceAnalyzeParameters, {results: Data[]}>(SpaceConnector.clientV2.inventory.cloudService.analyze);
const fetchData = async (): Promise<Data[]> => {
    try {
        state.loading = true;

        apiQueryHelper.setFilters(widgetState.consoleFilters);
        if (pageSize.value) apiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);

        // NOTE: temp code
        let _dataField = widgetState.dataField;
        if (widgetState.dataField === 'additional_info.service') _dataField = 'data.service';
        if (widgetState.dataField === 'additional_info.status') _dataField = 'data.status';
        if (widgetState.dataField === 'additional_info.severity') _dataField = 'data.severity';
        const { status, response } = await fetchCloudServiceAnalyze({
            query: {
                group_by: [_dataField],
                fields: {
                    pass_finding_count: {
                        key: 'data.stats.findings.pass',
                        operator: 'sum',
                    },
                    fail_finding_count: {
                        key: 'data.stats.findings.fail',
                        operator: 'sum',
                    },
                },
                sort: [{ key: 'fail_finding_count', desc: false }],
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
const refineChartData = (data: Data[], parsedDataField: string|undefined, referenceMap: ReferenceMap): ChartData[] => {
    if (!data?.length || !parsedDataField) return [];

    const refinedChartData: ChartData[] = [];
    data.forEach((d) => {
        const rawValue = d[parsedDataField];
        let refinedValue: string|null|undefined;

        // google_cloud -> Google Cloud
        if (parsedDataField === ASSET_DATA_FIELD_MAP.REGION.name) refinedValue = referenceMap[rawValue]?.name ?? rawValue;
        else refinedValue = referenceMap[rawValue]?.label ?? rawValue;

        refinedChartData.push({
            ...d,
            [parsedDataField]: refinedValue ?? `no_${parsedDataField}`,
        });
    });
    return refinedChartData;
};
const drawChart = (chartData: ChartData[]) => {
    if (!widgetState.parsedDataField) {
        console.error(new Error('parsedDataField is undefined'));
        return;
    }

    // create chart and axis
    const { chart, xAxis, yAxis } = chartHelper.createXYHorizontalChart();
    yAxis.set('categoryField', widgetState.parsedDataField);
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
            categoryYField: widgetState.parsedDataField,
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
    initWidget,
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
                               :loading="props.loading || state.loading"
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
