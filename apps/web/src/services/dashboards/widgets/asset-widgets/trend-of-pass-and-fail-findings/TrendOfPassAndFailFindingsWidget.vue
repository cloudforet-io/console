<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ReferenceType } from '@/store/reference/all-reference-store';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { setXYSharedTooltipTextWithRate } from '@/common/composables/amcharts5/xy-chart-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetChartNoDataOverlay from '@/services/dashboards/widgets/_components/WidgetChartNoDataOverlay.vue';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { CloudServiceStatsModel } from '@/services/dashboards/widgets/_configs/asset-config';
import { COMPLIANCE_STATUS_MAP } from '@/services/dashboards/widgets/_configs/asset-config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
import type {
    WidgetExpose, WidgetProps,
    WidgetEmit,
} from '@/services/dashboards/widgets/_configs/config';
import { ASSET_GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import {
    getDateAxisSettings,
} from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import {
    getReferenceTypeOfGroupBy, getRefinedDateTableData, getWidgetTableDateFields,
} from '@/services/dashboards/widgets/_helpers/widget-table-helper';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
import { useWidgetPagination } from '@/services/dashboards/widgets/_hooks/use-widget-pagination';
// eslint-disable-next-line import/no-cycle
import { useWidget } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';
import type { Legend, XYChartData } from '@/services/dashboards/widgets/type';


interface ChartDataModel extends CloudServiceStatsModel {
    value: Array<{ key: string, value: number }>;
}
interface TableDataModel extends CloudServiceStatsModel {
    value: Array<{ date: string; value: number }>;
}
interface FullData {
    chartData: { results: ChartDataModel[] }|null;
    tableData: { more: boolean, results: TableDataModel[] }|null;
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
        const end = dayjs.utc(widgetState.settings?.date_range?.end).format(DATE_FORMAT);
        const range = props.size === WIDGET_SIZE.full ? 11 : 3;
        const start = dayjs.utc(end).subtract(range, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
});

const state = reactive({
    loading: true,
    data: null as FullData | null,
    groupByKey: computed<string|undefined>(() => {
        // ex. additional_info.service -> service
        if (!widgetState.groupBy) return undefined;
        const dotIndex = widgetState.groupBy.indexOf('.');
        if (dotIndex !== -1) return widgetState.groupBy.slice(dotIndex + 1);
        return widgetState.groupBy;
    }),
    chartData: computed<XYChartData[]>(() => refineChartData(state.data?.chartData?.results ?? [])),
    noChartData: computed<boolean>(() => !state.data?.chartData),
    tableLoading: false,
    tableFields: computed<Field[]>(() => {
        if (!widgetState.groupBy) return [];
        const refinedFields = getWidgetTableDateFields(widgetState.granularity, widgetState.dateRange, { type: 'number' }, 'value');
        const refinedFieldsWithLabel = refinedFields.map((field) => ({
            ...field,
            label: `${field.label}\nFailure count`,
            width: props.size === 'full' ? TABLE_COL_MIN_WIDTH : undefined,
        }));
        const groupByLabel = ASSET_GROUP_BY_ITEM_MAP[widgetState.groupBy]?.label ?? widgetState.groupBy;
        const referenceType = getReferenceTypeOfGroupBy(props.allReferenceTypeInfo, widgetState.groupBy) as ReferenceType;
        return [
            {
                label: groupByLabel,
                name: state.groupByKey,
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
const fetchChartDataAnalyze = getCancellableFetcher<FullData['chartData']>(SpaceConnector.clientV2.inventory.cloudServiceStats.analyze);
const fetchTableDataAnalyze = getCancellableFetcher<FullData['tableData']>(SpaceConnector.clientV2.inventory.cloudServiceStats.analyze);
const fetchChartData = async (): Promise<FullData['chartData']> => {
    state.loading = true;
    try {
        chartDataApiQueryHelper
            .setFilters(widgetState.cloudServiceStatsConsoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' })
            .addFilter({ k: 'key', v: ['pass_finding_count', 'fail_finding_count'], o: '' });
        const { status, response } = await fetchChartDataAnalyze({
            query: {
                granularity: 'MONTHLY',
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                group_by: ['key', 'unit'],
                fields: {
                    value: {
                        key: 'value',
                        operator: 'sum',
                    },
                },
                field_group: ['key'],
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
            .setFilters(widgetState.cloudServiceStatsConsoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' })
            .addFilter({ k: 'key', v: ['fail_finding_count'], o: '' });
        if (pageSize.value) tableDataApiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);
        const { status, response } = await fetchTableDataAnalyze({
            query: {
                granularity: 'MONTHLY',
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                group_by: ['key', 'unit', widgetState.groupBy],
                fields: {
                    value: {
                        key: 'value',
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
const refineChartData = (data: ChartDataModel[]): XYChartData[] => {
    if (!data?.length) return [];
    const refinedChartData: XYChartData[] = [];
    data.forEach((d) => {
        refinedChartData.push({
            date: d.date,
            [COMPLIANCE_STATUS_MAP.PASS.name]: d.value.find((v) => v.key === 'fail_finding_count')?.value ?? 0,
            [COMPLIANCE_STATUS_MAP.FAIL.name]: d.value.find((v) => v.key === 'pass_finding_count')?.value ?? 0,
        });
    });
    return refinedChartData;
};
const drawChart = (chartData: XYChartData[]) => {
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
                               :loading="state.loading"
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
