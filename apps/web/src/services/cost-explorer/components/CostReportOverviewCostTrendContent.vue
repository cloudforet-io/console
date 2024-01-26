<script lang="ts" setup>
import {
    computed,
    reactive, ref, watch,
} from 'vue';

import type * as am5xy from '@amcharts/amcharts5/xy';
import {
    PCollapsibleToggle,
    PDataLoader, PDataTable, PSkeleton,
} from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/src/data-display/tables/data-table/type';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { CostReportDataAnalyzeParameters } from '@/schema/cost-analysis/cost-report-data/api-verbs/analyze';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { getDataTableCostFields } from '@/services/cost-explorer/helpers/cost-analysis-data-table-helper';
import { getLegends, getXYChartData } from '@/services/cost-explorer/helpers/cost-explorer-chart-data-helper';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';
import type { Legend, XYChartData } from '@/services/cost-explorer/types/cost-explorer-chart-type';


type CostReportDataAnalyzeResult = {
    [groupBy: string]: string | any;
    value_sum?: Array<{
        date: string;
        value: number
    }>;
    _total_value_sum?: number;
};
interface Props {
    groupBy?: string;
    period: { start: string; end: string };
}
const props = withDefaults(defineProps<Props>(), {
    groupBy: undefined,
    period: undefined,
});

const DATE_FIELD_NAME = 'date';
const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const costReportPageStore = useCostReportPageStore();
const costReportPageGetters = costReportPageStore.getters;
const state = reactive({
    loading: true,
    data: {} as AnalyzeResponse<CostReportDataAnalyzeResult>,
    legends: [] as Legend[],
    chartData: [] as XYChartData[],
    isDetailsCollapsed: true,
    tableFields: computed<DataTableFieldType[]>(() => {
        const targetField = state.targetSelectItems.find((item) => item.name === state.selectedTarget) ?? {};
        const subTotalField = {
            name: '_total_value_sum',
            label: 'Sub Total',
            textAlign: 'right',
            sortable: false,
        };
        const costFields = getDataTableCostFields(GRANULARITY.MONTHLY, state.period, true);
        return [targetField, subTotalField, ...costFields];
    }),
    tableItems: [],
});

/* Api */
const analyzeTrendData = async () => {
    state.loading = true;
    try {
        state.data = await SpaceConnector.clientV2.costAnalysis.costReportData.analyze<CostReportDataAnalyzeParameters, AnalyzeResponse<CostReportDataAnalyzeResult>>({
            query: {
                granularity: GRANULARITY.MONTHLY,
                group_by: [props.groupBy],
                field_group: ['date'],
                start: props.period.start,
                end: props.period.end,
                fields: {
                    value_sum: {
                        key: `cost.${costReportPageGetters.currency}`,
                        operator: 'sum',
                    },
                },
                sort: [{
                    key: '_total_value_sum',
                    desc: true,
                }],
            },
        });
    } catch (e) {
        state.data = {};
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* Util */
const drawChart = () => {
    chartHelper.refreshRoot();
    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart();

    // set base interval of xAxis
    xAxis.get('baseInterval').timeUnit = 'month';

    // set label adapter of yAxis
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    yAxis.get('renderer').remove('labels');

    // set min value of yAxis
    state.legends.forEach((legend) => {
        // create series
        const seriesSettings: Partial<am5xy.IXYSeriesSettings> = {
            name: legend.label as string,
            valueYField: legend.name,
            stacked: true,
            stroke: undefined,
        };
        if (legend.color) seriesSettings.fill = chartHelper.color(legend.color);
        const series = chartHelper.createXYColumnSeries(chart, seriesSettings);

        chart.series.push(series);

        // set data processor
        const dateFormat = 'yyyy-MM';
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat,
            dateFields: [DATE_FIELD_NAME],
        });

        // create tooltip and set on series
        const tooltip = chartHelper.createTooltip();
        chartHelper.setXYSharedTooltipText(chart, tooltip);
        series.set('tooltip', tooltip);

        // set data
        series.data.setAll(cloneDeep(state.chartData));
    });
};

/* Init */
(async () => {
    await analyzeTrendData();
})();

/* Watcher */
watch([() => state.loading, () => chartContext.value], async ([loading, _chartContext]) => {
    if (!loading && _chartContext) {
        state.legends = getLegends(state.data, GRANULARITY.MONTHLY, props.groupBy);
        state.chartData = getXYChartData(state.data, GRANULARITY.MONTHLY, props.period, props.groupBy);
        drawChart();
    }
}, { immediate: true });
</script>

<template>
    <div>
        <p-data-loader class="chart-wrapper"
                       :loading="state.loading"
                       :data="state.chartData"
        >
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartContext"
                 class="chart"
            />
        </p-data-loader>
        <div v-if="!state.isDetailsCollapsed">
            <p-data-table :fields="state.tableFields"
                          :items="state.data.results"
            />
        </div>
        <p-collapsible-toggle :is-collapsed.sync="state.isDetailsCollapsed"
                              class="collapsible-toggle"
        >
            {{ state.isDetailsCollapsed ? $t('BILLING.COST_MANAGEMENT.COST_REPORT.SHOW_DETAILS') : $t('BILLING.COST_MANAGEMENT.COST_REPORT.HIDE') }}
        </p-collapsible-toggle>
    </div>
</template>

<style lang="postcss" scoped>
.chart-wrapper {
    height: 17rem;
    padding-top: 1.5rem;
    padding-bottom: 1rem;
    .chart {
        height: 100%;
        width: 100%;
    }
}
</style>
