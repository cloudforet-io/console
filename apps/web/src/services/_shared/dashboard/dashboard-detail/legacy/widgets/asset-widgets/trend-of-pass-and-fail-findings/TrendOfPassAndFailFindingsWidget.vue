<script setup lang="ts">
import {
    computed, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';

import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PDataLoader } from '@cloudforet/mirinae';

import { ASSET_DATA_FIELD_MAP, WIDGET_SIZE } from '@/api-clients/dashboard/_constants/widget-constant';
import type { DateRange } from '@/api-clients/dashboard/_types/dashboard-type';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { setXYSharedTooltipTextWithRate } from '@/common/composables/amcharts5/xy-chart-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import WidgetChartNoDataOverlay from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetChartNoDataOverlay.vue';
import WidgetDataTable from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import { useWidgetColorSet } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-color-set';
import { useWidgetLifecycle } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-lifecycle';
import { useWidgetPagination } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-pagination';
import { useWidget } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import { COMPLIANCE_STATUS_MAP } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_constants/compliance-constant';
import {
    getDateAxisSettings,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-chart-helper';
import {
    getReferenceTypeOfDataField, getRefinedDateTableData, getWidgetTableDateFields,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-table-helper';
import type { Field } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-data-table-type';
import type {
    WidgetExpose, WidgetProps,
    WidgetEmit,
    Legend,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';
import type { ReferenceType } from '@/services/dashboards/stores/all-reference-type-info-store';



interface ChartDataResult {
    pass_finding_count: number;
    fail_finding_count: number;
    date: string;
}
interface TableDataModel {
    value: Array<{ date: string; value: number }>;
    date: string;
}
interface FullData {
    chartData: { results: ChartDataResult[] }|null;
    tableData: { more: boolean, results: TableDataModel[] }|null;
}
interface ChartData {
    date: string;
    [COMPLIANCE_STATUS_MAP.PASS.name]: number;
    [COMPLIANCE_STATUS_MAP.FAIL.name]: number;
}

const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';
const TABLE_COL_MIN_WIDTH = '5rem';

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.legends?.length ?? 0),
});

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(widgetState.dashboardOptions?.date_range?.end).format(DATE_FORMAT);
        const range = props.size === WIDGET_SIZE.full ? 11 : 3;
        const start = dayjs.utc(end).subtract(range, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    widgetLocation: undefined,
});

const state = reactive({
    loading: true,
    data: null as FullData | null,
    chartData: computed<ChartData[]>(() => refineChartData(state.data?.chartData?.results ?? [])),
    noChartData: computed<boolean>(() => !state.data?.chartData),
    tableLoading: false,
    tableFields: computed<Field[]>(() => {
        if (!widgetState.dataField) return [];
        const refinedFields = getWidgetTableDateFields(widgetState.granularity, widgetState.dateRange, { type: 'number' }, 'value');
        const refinedFieldsWithLabel = refinedFields.map((field) => ({
            ...field,
            label: `${field.label}\nFailure count`,
            width: props.size === 'full' ? TABLE_COL_MIN_WIDTH : undefined,
        }));
        const dataFieldLabel = Object.values(ASSET_DATA_FIELD_MAP).find((d) => d.name === widgetState.dataField)?.label ?? widgetState.parsedDataField;
        const referenceType = getReferenceTypeOfDataField(props.allReferenceTypeInfo, widgetState.dataField) as ReferenceType;
        return [
            {
                label: dataFieldLabel,
                name: widgetState.parsedDataField,
                textOptions: { type: 'reference', referenceType },
                width: props.size === 'full' ? TABLE_COL_MIN_WIDTH : undefined,
            },
            ...refinedFieldsWithLabel,
        ];
    }),
    tableData: computed<FullData['tableData']>(() => {
        if (!state.data?.tableData) return { more: false, results: [] };
        const refinedData = getRefinedDateTableData(state.data?.tableData?.results ?? [], widgetState.dateRange, 'value');
        return { ...state.data?.tableData, results: refinedData };
    }),
    legends: [] as Legend[],
    disableReferenceColor: computed<boolean>(() => !!props.theme),
});

const { pageSize, thisPage } = useWidgetPagination(widgetState);

/* Api */
const chartDataApiQueryHelper = new ApiQueryHelper();
const tableDataApiQueryHelper = new ApiQueryHelper();
const fetchChartDataAnalyze = getCancellableFetcher<object, FullData['chartData']>(SpaceConnector.clientV2.inventory.cloudServiceStats.analyze);
const fetchTableDataAnalyze = getCancellableFetcher<object, FullData['tableData']>(SpaceConnector.clientV2.inventory.cloudServiceStats.analyze);
const fetchChartData = async (): Promise<FullData['chartData']> => {
    state.loading = true;
    try {
        chartDataApiQueryHelper.setFilters(widgetState.consoleFilters);
        const { status, response } = await fetchChartDataAnalyze({
            query_set_id: widgetState.options.cloud_service_query_set,
            query: {
                granularity: 'MONTHLY',
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                fields: {
                    pass_finding_count: {
                        key: 'data.pass_finding_count',
                        operator: 'sum',
                    },
                    fail_finding_count: {
                        key: 'data.fail_finding_count',
                        operator: 'sum',
                    },
                },
                sort: [{ key: DATE_FIELD_NAME, desc: false }],
                ...chartDataApiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            state.loading = false;
            return response;
        }
        return state.data?.chartData ?? null;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.loading = false;
        return { results: [] };
    }
};
const fetchTableData = async (): Promise<FullData['tableData']> => {
    try {
        state.tableLoading = true;

        tableDataApiQueryHelper
            .setFilters(widgetState.consoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' });
        if (pageSize.value) tableDataApiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);
        const { status, response } = await fetchTableDataAnalyze({
            query_set_id: widgetState.options.cloud_service_query_set,
            query: {
                granularity: 'MONTHLY',
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                group_by: [widgetState.dataField],
                fields: {
                    value: {
                        key: 'data.fail_finding_count',
                        operator: 'sum',
                    },
                },
                field_group: [DATE_FIELD_NAME],
                sort: [
                    { key: DATE_FIELD_NAME, desc: false },
                    { key: '_total_value', desc: true },
                ],
                ...tableDataApiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            state.tableLoading = false;
            return response;
        }
        return state.data?.tableData ?? null;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.tableLoading = false;
        return { more: false, results: [] };
    }
};

/* Util */
const refineChartData = (data: ChartDataResult[]): ChartData[] => {
    if (!data?.length) return [];
    const refinedChartData: ChartData[] = [];
    data.forEach((d) => {
        refinedChartData.push({
            date: d.date,
            [COMPLIANCE_STATUS_MAP.PASS.name]: d.pass_finding_count ?? 0,
            [COMPLIANCE_STATUS_MAP.FAIL.name]: d.fail_finding_count ?? 0,
        });
    });
    return refinedChartData;
};
const drawChart = (chartData: ChartData[]) => {
    // create chart and axis
    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(widgetState.dateRange));

    // set axes
    xAxis.get('baseInterval').timeUnit = 'month';
    xAxis.get('renderer').grid.template.setAll({
        strokeOpacity: 1,
        location: 0.5,
    });
    yAxis.get('renderer').setAll({
        minGridDistance: 18,
    });

    // set cursor
    chart.get('cursor')?.lineX.setAll({
        visible: true,
    });

    // set series for each compliance status
    Object.entries(COMPLIANCE_STATUS_MAP).forEach(([k, v]) => {
        const seriesSettings = {
            name: v.label,
            valueYField: k,
            stroke: v.color,
            fill: v.color,
            stacked: true,
        };

        // create series
        const series = chartHelper.createXYLineSeries(chart, seriesSettings);

        // add series to chart
        chart.series.push(series);

        // set series style
        series.fills.template.setAll({
            opacity: 0.2,
            visible: true,
        });

        // set data processor to series
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat: DATE_FORMAT,
            dateFields: [DATE_FIELD_NAME],
        });

        // create tooltip
        const tooltip = chartHelper.createTooltip();
        setXYSharedTooltipTextWithRate(chart, tooltip);

        // set tooltip to series
        series.set('tooltip', tooltip);

        // set data to series
        series.data.setAll(cloneDeep(chartData));
    });
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    if (data) {
        state.data = data;
    } else {
        const [chartData, tableData] = await Promise.all([fetchChartData(), fetchTableData()]);
        state.data = { chartData, tableData };
    }
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    return state.data;
};
const refreshWidget = async (_thisPage = 1): Promise<FullData> => {
    thisPage.value = _thisPage;
    const [chartData, tableData] = await Promise.all([fetchChartData(), fetchTableData()]);
    state.data = { chartData, tableData };
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    return state.data;
};

/* Event */
const handleUpdateThisPage = async (_thisPage: number) => {
    state.tableLoading = true;
    thisPage.value = _thisPage;
    state.data.tableData = await fetchTableData();
    state.tableLoading = false;
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    initWidget,
    refreshWidget,
    props,
    emit,
    widgetState,
});

defineExpose<WidgetExpose<FullData>>({
    initWidget,
    refreshWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="trend-of-pass-and-fail-findings"
                  refresh-on-resize
                  v-on="widgetFrameEventHandlers"
    >
        <div class="data-container">
            <div class="chart-wrapper">
                <p-data-loader class="chart-loader"
                               :loading="props.loading || state.loading"
                               :data="state.chartData"
                               loader-type="skeleton"
                               disable-empty-case
                               :loader-backdrop-opacity="1"
                >
                    <div ref="chartContext"
                         class="chart"
                    />
                    <widget-chart-no-data-overlay v-if="state.noChartData && !state.loading" />
                </p-data-loader>
            </div>
            <widget-data-table :loading="state.loading || state.tableLoading"
                               :fields="state.tableFields"
                               :items="state.tableData.results"
                               :all-reference-type-info="props.allReferenceTypeInfo"
                               :legends.sync="state.legends"
                               :color-set="colorSet"
                               :this-page="thisPage"
                               :show-next-page="state.tableData.more"
                               disable-row-click
                               @update:thisPage="handleUpdateThisPage"
            />
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.trend-of-pass-and-fail-findings {
    .data-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        .chart-wrapper {
            position: relative;
            height: 185px;
            margin-bottom: 1rem;
            .chart-loader {
                height: 100%;
                .chart {
                    height: 100%;
                }
            }
        }
        .widget-data-table {
            flex-grow: 1;
        }
    }
    &.full {
        .widget-data-table {
            height: auto;
        }
    }
}
</style>
