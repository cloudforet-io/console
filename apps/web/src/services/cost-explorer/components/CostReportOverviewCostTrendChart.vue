<script lang="ts" setup>
import {
    computed,
    reactive, ref, watch,
} from 'vue';

import type * as am5xy from '@amcharts/amcharts5/xy';
import {
    PCollapsibleToggle, PDataTable, PSkeleton,
} from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/src/data-display/tables/data-table/type';
import dayjs from 'dayjs';
import {
    cloneDeep, find, sortBy, sumBy,
} from 'lodash';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import { gray } from '@/styles/colors';

import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { getDataTableCostFields } from '@/services/cost-explorer/helpers/cost-analysis-data-table-helper';
import { getLegends, getXYChartData } from '@/services/cost-explorer/helpers/cost-explorer-chart-data-helper';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';
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

const OTHER_CATEGORY = 'Others';
const DATE_FIELD_NAME = 'date';
const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const allReferenceStore = useAllReferenceStore();
const costReportPageStore = useCostReportPageStore();
const costReportPageGetters = costReportPageStore.getters;
const storeState = reactive({
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
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
const getRefinedAnalyzeData = (res: AnalyzeResponse<CostReportDataAnalyzeResult>): AnalyzeResponse<CostReportDataAnalyzeResult> => {
    const _results: CostReportDataAnalyzeResult[] = [];
    const _totalAmount = sumBy(res.results, '_total_value_sum');
    const _thresholdValue = _totalAmount * 0.02;
    const _othersResult: CostReportDataAnalyzeResult = {
        [props.groupBy]: OTHER_CATEGORY,
        _total_value_sum: 0,
        value_sum: [],
    };
    res.results?.forEach((d) => {
        if (d._total_value_sum && (d._total_value_sum < _thresholdValue)) {
            _othersResult._total_value_sum += d._total_value_sum;
            d.value_sum?.forEach((v) => {
                const _target = find(_othersResult.value_sum, { date: v.date });
                if (_target) {
                    _target.value += v.value;
                } else {
                    _othersResult.value_sum?.push({ ...v });
                }
            });
        } else {
            _results.push(d);
        }
    });
    if (_othersResult._total_value_sum > 0) {
        _results.push(_othersResult);
    }
    return {
        more: res.more,
        results: _results,
    };
};
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
        if (legend.color) {
            seriesSettings.fill = chartHelper.color(legend.color);
        }
        if (legend.name === OTHER_CATEGORY) {
            seriesSettings.fill = chartHelper.color(gray[500]);
        }
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
        const formatter = (value) => currencyMoneyFormatter(value, { currency: costReportPageGetters.currency, style: 'decimal' }) as string;
        chartHelper.setXYSharedTooltipText(chart, tooltip, formatter);
        // set tooltip
        series.set('tooltip', tooltip);

        // set data
        series.data.setAll(cloneDeep(state.chartData));
    });
};
/* Watcher */
watch([() => props.loading, () => chartContext.value], async ([loading, _chartContext]) => {
    if (!loading && _chartContext) {
        const _refinedData = getRefinedAnalyzeData(props.data);
        state.legends = getLegends(_refinedData, GRANULARITY.MONTHLY, props.groupBy);
        state.chartData = getXYChartData(_refinedData, GRANULARITY.MONTHLY, props.period, props.groupBy);
        drawChart();
    }
}, { immediate: true });
</script>

<template>
    <div>
        <div class="chart-wrapper">
            <p-skeleton v-if="props.loading"
                        height="100%"
            />
            <div v-show="!props.loading"
                 ref="chartContext"
                 class="chart"
            />
        </div>
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
                    <span v-else-if="field.name.includes('value_sum')">
                        {{ currencyMoneyFormatter(value, { currency: costReportPageGetters.currency, style: 'decimal' }) }}
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
