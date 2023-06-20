<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="trend-of-pass-and-fail-findings"
                  refresh-on-resize
                  @refresh="refreshWidget"
    >
        <div class="data-container">
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
            </div>
            <widget-data-table :loading="state.loading || state.tableLoading"
                               :fields="state.tableFields"
                               :items="state.tableData.results"
                               :all-reference-type-info="props.allReferenceTypeInfo"
                               :legends.sync="state.legends"
                               :color-set="colorSet"
                               :this-page="state.thisPage"
                               :show-next-page="state.tableData.more"
                               @update:thisPage="handleUpdateThisPage"
            />
        </div>
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef, toRefs,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ReferenceType } from '@/store/modules/reference/type';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { setXYSharedTooltipTextWithRate } from '@/common/composables/amcharts5/xy-chart-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { CloudServiceStatsModel } from '@/services/dashboards/widgets/_configs/asset-config';
import { COMPLIANCE_STATUS_MAP } from '@/services/dashboards/widgets/_configs/asset-config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
import type {
    WidgetExpose, WidgetProps,
} from '@/services/dashboards/widgets/_configs/config';
import { ASSET_GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import {
    getDateAxisSettings,
} from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import {
    getReferenceTypeOfGroupBy, getRefinedDateTableData, getWidgetTableDateFields,
} from '@/services/dashboards/widgets/_helpers/widget-table-helper';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { Legend, XYChartData } from '@/services/dashboards/widgets/type';


interface ChartDataModel extends CloudServiceStatsModel {
    value: Array<{ key: string, value: number }>;
}
interface TableDataModel extends CloudServiceStatsModel {
    value: Array<{ date: string; value: number }>;
}
interface FullData {
    chartData?: { results: ChartDataModel[] };
    tableData?: { more: boolean, results: TableDataModel[] };
}

const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';
const TABLE_COL_MIN_WIDTH = '5rem';

const props = defineProps<WidgetProps>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.legends?.length ?? 0),
});
const state = reactive({
    ...toRefs(useWidgetState<FullData>(props)),
    groupByKey: computed<string|undefined>(() => {
        // ex. additional_info.service -> service
        if (!state.groupBy) return undefined;
        const dotIndex = state.groupBy.indexOf('.');
        if (dotIndex !== -1) return state.groupBy.slice(dotIndex + 1);
        return state.groupBy;
    }),
    chartData: computed<XYChartData[]>(() => refineChartData(state.data?.chartData?.results ?? [])),
    tableLoading: false,
    tableFields: computed<Field[]>(() => {
        if (!state.groupBy) return [];
        const refinedFields = getWidgetTableDateFields(state.granularity, state.dateRange, { type: 'number' }, 'value');
        const refinedFieldsWithLabel = refinedFields.map((field) => ({
            ...field,
            label: `${field.label}\nFailure count`,
            width: state.size === 'full' ? TABLE_COL_MIN_WIDTH : undefined,
        }));
        const groupByLabel = ASSET_GROUP_BY_ITEM_MAP[state.groupBy]?.label ?? state.groupBy;
        const referenceType = getReferenceTypeOfGroupBy(props.allReferenceTypeInfo, state.groupBy) as ReferenceType;
        return [
            {
                label: groupByLabel,
                name: state.groupByKey,
                textOptions: { type: 'reference', referenceType },
                width: state.size === 'full' ? TABLE_COL_MIN_WIDTH : undefined,
            },
            ...refinedFieldsWithLabel,
        ];
    }),
    tableData: computed<FullData['tableData']>(() => {
        if (!state.data?.tableData) return { more: false, results: [] };
        const refinedData = getRefinedDateTableData(state.data?.tableData?.results ?? [], state.dateRange, 'value');
        return { ...state.data?.tableData, results: refinedData };
    }),
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT);
        const range = props.size === WIDGET_SIZE.full ? 11 : 3;
        const start = dayjs.utc(end).subtract(range, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    legends: [] as Legend[],
    thisPage: 1,
    disableReferenceColor: computed<boolean>(() => !!props.theme),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
let chartAnalyzeRequest: CancelTokenSource | undefined;
let tableAnalyzeRequest: CancelTokenSource | undefined;
const fetchChartData = async (): Promise<FullData['chartData']> => {
    if (chartAnalyzeRequest) {
        chartAnalyzeRequest.cancel('Next request has been called.');
        chartAnalyzeRequest = undefined;
    }
    chartAnalyzeRequest = axios.CancelToken.source();
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper
            .setFilters(state.cloudServiceStatsConsoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' })
            .addFilter({ k: 'key', v: ['pass_finding_count', 'fail_finding_count'], o: '' });
        const res = await SpaceConnector.clientV2.inventory.cloudServiceStats.analyze({
            query: {
                granularity: 'MONTHLY',
                start: state.dateRange.start,
                end: state.dateRange.end,
                group_by: ['key', 'unit'],
                fields: {
                    value: {
                        key: 'value',
                        operator: 'sum',
                    },
                },
                field_group: ['key'],
                sort: [{ key: DATE_FIELD_NAME, desc: false }],
                ...apiQueryHelper.data,
            },
        }, { cancelToken: chartAnalyzeRequest.token });
        chartAnalyzeRequest = undefined;
        return res;
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [] };
    }
};
const fetchTableData = async (): Promise<FullData['tableData']> => {
    if (tableAnalyzeRequest) {
        tableAnalyzeRequest.cancel('Next request has been called.');
        tableAnalyzeRequest = undefined;
    }
    tableAnalyzeRequest = axios.CancelToken.source();
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper
            .setFilters(state.cloudServiceStatsConsoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' })
            .addFilter({ k: 'key', v: ['fail_finding_count'], o: '' });
        if (state.pageSize) apiQueryHelper.setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
        const res = await SpaceConnector.clientV2.inventory.cloudServiceStats.analyze({
            query: {
                granularity: 'MONTHLY',
                start: state.dateRange.start,
                end: state.dateRange.end,
                group_by: ['key', 'unit', state.groupBy],
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
                ...apiQueryHelper.data,
            },
        }, { cancelToken: tableAnalyzeRequest.token });
        tableAnalyzeRequest = undefined;
        return res;
    } catch (e) {
        ErrorHandler.handleError(e);
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
    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(state.dateRange));
    xAxis.get('baseInterval').timeUnit = 'month';
    xAxis.get('renderer').grid.template.setAll({
        strokeOpacity: 1,
        location: 0.5,
    });
    yAxis.get('renderer').setAll({
        minGridDistance: 18,
    });
    chart.get('cursor')?.lineX.setAll({
        visible: true,
    });

    Object.entries(COMPLIANCE_STATUS_MAP).forEach(([k, v]) => {
        const seriesSettings = {
            name: v.label,
            valueYField: k,
            stroke: v.color,
            fill: v.color,
            stacked: true,
        };
        const series = chartHelper.createXYLineSeries(chart, seriesSettings);
        chart.series.push(series);
        series.bullets.clear();
        series.fills.template.setAll({
            opacity: 0.2,
            visible: true,
        });
        // set data processor
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat: DATE_FORMAT,
            dateFields: [DATE_FIELD_NAME],
        });
        const tooltip = chartHelper.createTooltip();
        setXYSharedTooltipTextWithRate(chart, tooltip);
        series.set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    state.loading = true;
    if (data) {
        state.data = data;
    } else {
        const [chartData, tableData] = await Promise.all([fetchChartData(), fetchTableData()]);
        state.data = { chartData, tableData };
    }
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};
const refreshWidget = async (thisPage = 1): Promise<FullData> => {
    await nextTick();
    state.loading = true;
    state.thisPage = thisPage;
    const [chartData, tableData] = await Promise.all([fetchChartData(), fetchTableData()]);
    state.data = { chartData, tableData };
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

/* Event */
const handleUpdateThisPage = async (thisPage: number) => {
    state.tableLoading = true;
    state.thisPage = thisPage;
    state.data.tableData = await fetchTableData();
    state.tableLoading = false;
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
    state,
});

defineExpose<WidgetExpose<FullData>>({
    initWidget,
    refreshWidget,
});
</script>

<style lang="postcss" scoped>
.trend-of-pass-and-fail-findings {
    .data-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        .chart-wrapper {
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
