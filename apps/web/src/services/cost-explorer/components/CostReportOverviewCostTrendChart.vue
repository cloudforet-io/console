<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed,
    reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { BarSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import {
    cloneDeep, find, isEmpty, sortBy, throttle,
} from 'lodash';

import {
    PCollapsibleToggle, PDataTable,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { numberFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import {
    getDateLabelFormat,
    getReferenceLabel,
    getWidgetDateFields,
} from '@/common/modules/widgets/_helpers/widget-date-helper';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';

import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { getDataTableCostFields } from '@/services/cost-explorer/helpers/cost-analysis-data-table-helper';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';
import type { CostReportDataAnalyzeResult } from '@/services/cost-explorer/types/cost-report-data-type';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';


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

const LIMIT = 15;
const DATE_FIELD_NAME = 'date';
const chartContext = ref<HTMLElement|null>(null);
const allReferenceStore = useAllReferenceStore();
const costReportPageStore = useCostReportPageStore();
const costReportPageGetters = costReportPageStore.getters;
const storeState = reactive({
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
});
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const state = reactive({
    xAxisData: computed(() => getWidgetDateFields(GRANULARITY.MONTHLY, props.period?.start, props.period?.end)),
    chartData: [],
    chart: null as EChartsType | null,
    chartOptions: computed<BarSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        grid: {
            left: 0,
            right: 0,
            top: '3%',
            bottom: '3%',
            containLabel: true,
        },
        legend: {
            show: false,
        },
        tooltip: {
            formatter: (params) => {
                const _params = Array.isArray(params) ? params : [params];
                return _params.map((p) => {
                    const _seriesName = getReferenceLabel(storeState.allReferenceTypeInfo, props.groupBy, p.seriesName);
                    const _value = numberFormatter(p.value) || '';
                    return `${_seriesName}<br>${p.marker} ${params.name}: <b>${_value}</b>`;
                }).join('<br>');
            },
        },
        xAxis: {
            type: 'category',
            data: state.xAxisData,
            axisLabel: {
                formatter: (val) => dayjs.utc(val).format(getDateLabelFormat(GRANULARITY.MONTHLY)),
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (val) => numberFormatter(val, { notation: 'compact' }),
            },
        },
        series: state.chartData,
    })),
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
const drawChart = (rawData: AnalyzeResponse<CostReportDataAnalyzeResult>) => {
    if (isEmpty(rawData)) return;

    const _slicedData = rawData.results?.slice(0, LIMIT);
    const _etcData = rawData.results?.slice(LIMIT);

    const _seriesData: any[] = [];
    _slicedData?.forEach((d) => {
        let _color: string|undefined;
        if (props.groupBy === 'provider') {
            _color = storeState.providers[d[props.groupBy]]?.color;
        }
        _seriesData.push({
            name: d[props.groupBy] || '--',
            type: 'bar',
            stack: true,
            barMaxWidth: 50,
            itemStyle: {
                color: _color,
            },
            data: state.xAxisData.map((xAxis) => {
                const _data = d.value_sum?.find((v) => v[DATE_FIELD_NAME] === xAxis);
                return _data ? _data?.value : undefined;
            }),
        });
    });
    if (_etcData?.length) {
        _seriesData.push({
            name: 'etc',
            type: 'bar',
            stack: true,
            barMaxWidth: 50,
            data: state.xAxisData.map((xAxis) => {
                const _data = _etcData.reduce((acc, d) => {
                    const _value = d.value_sum?.find((v) => v[DATE_FIELD_NAME] === xAxis);
                    return acc + (_value ? _value.value : 0);
                }, 0);
                return _data;
            }),
        });
    }
    state.chartData = _seriesData;

    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
};

/* Watcher */
watch([() => chartContext.value, () => props.loading, () => props.data], async ([_chartContext, loading, data]) => {
    if (_chartContext && !loading) {
        drawChart(data);
    }
});
useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 300));
</script>

<template>
    <div class="cost-report-overview-cost-trend-chart">
        <div class="chart-wrapper">
            <div ref="chartContext"
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
.cost-report-overview-cost-trend-chart {
    width: 100%;
}
.chart-wrapper {
    width: 100%;
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
