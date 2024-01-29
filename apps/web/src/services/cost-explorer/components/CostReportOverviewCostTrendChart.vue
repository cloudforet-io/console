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
import dayjs from 'dayjs';
import {
    cloneDeep, find, sortBy,
} from 'lodash';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { getDataTableCostFields } from '@/services/cost-explorer/helpers/cost-analysis-data-table-helper';
import { getLegends, getXYChartData } from '@/services/cost-explorer/helpers/cost-explorer-chart-data-helper';
import type { Legend, XYChartData } from '@/services/cost-explorer/types/cost-explorer-chart-type';
import type { CostReportDataAnalyzeResult } from '@/services/cost-explorer/types/cost-report-data-type';


interface Props {
    groupBy: string;
    period: { start: string; end: string };
    loading: boolean;
    data: AnalyzeResponse<CostReportDataAnalyzeResult>;
}
const props = withDefaults(defineProps<Props>(), {
    loading: true,
    data: () => ({}),
});

const DATE_FIELD_NAME = 'date';
const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});
const state = reactive({
    legends: [] as Legend[],
    chartData: [] as XYChartData[],
    isDetailsCollapsed: true,
    tableFields: computed<DataTableFieldType[]>(() => {
        const targetField: DataTableFieldType = {
            name: props.groupBy,
            label: props.groupBy === 'workspace_id' ? 'Workspace' : 'Provider',
            sortable: false,
        };
        const subTotalField = {
            name: '_total_value_sum',
            label: 'Sub Total',
            textAlign: 'right',
            sortable: false,
        };
        const costFields = getDataTableCostFields(GRANULARITY.MONTHLY, props.period, true);
        return [targetField, subTotalField, ...costFields];
    }),
    tableItems: computed<CostReportDataAnalyzeResult[]>(() => {
        if (!props.data?.results) return [];
        const refinedTableData: CostReportDataAnalyzeResult[] = [];
        props.data.results.forEach((d) => {
            let target = cloneDeep(d.value_sum);
            let now = dayjs.utc(props.period.start).clone();
            while (now.isSameOrBefore(dayjs.utc(props.period.end), 'month')) {
                if (!find(target, { date: now.format('YYYY-MM') })) {
                    target?.push({ date: now.format('YYYY-MM'), value: 0 });
                }
                now = now.add(1, 'month');
            }
            target = sortBy(target, ['date']);
            refinedTableData.push({
                ...d,
                value_sum: target,
            });
        });
        return refinedTableData;
    }),
});

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
    await store.dispatch('reference/provider/load');
})();

/* Watcher */
watch([() => props.loading, () => chartContext.value], async ([loading, _chartContext]) => {
    if (!loading && _chartContext) {
        state.legends = getLegends(props.data, GRANULARITY.MONTHLY, props.groupBy);
        state.chartData = getXYChartData(props.data, GRANULARITY.MONTHLY, props.period, props.groupBy);
        drawChart();
    }
}, { immediate: true });
</script>

<template>
    <div>
        <p-data-loader class="chart-wrapper"
                       :loading="props.loading"
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
                          :items="state.tableItems"
            >
                <template #col-format="{field, value}">
                    <span v-if="field.name === GROUP_BY.WORKSPACE">
                        {{ storeState.workspaces[value] ? storeState.workspaces[value].label : value }}
                    </span>
                    <span v-else-if="field.name === GROUP_BY.PROVIDER">
                        {{ storeState.providers[value] ? storeState.providers[value].name : value }}
                    </span>
                </template>
            </p-data-table>
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
.collapsible-toggle {
    width: 100%;
    justify-content: center;
}
</style>
