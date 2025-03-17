<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { PieSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import {
    debounce, isEmpty, sum, sumBy, throttle,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PSelectButton, PDatePagination, PDataTable, PTextButton, PI, PTooltip, PDataLoader,
} from '@cloudforet/mirinae';
import type { SelectButtonType } from '@cloudforet/mirinae/types/controls/buttons/select-button-group/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { numberFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostReportDataAnalyzeParameters } from '@/api-clients/cost-analysis/cost-report-data/schema/api-verbs/analyze';
import type { CostReportListParameters } from '@/api-clients/cost-analysis/cost-report/schema/api-verbs/list';
import type { CostReportModel } from '@/api-clients/cost-analysis/cost-report/schema/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { CURRENCY_SYMBOL } from '@/store/display/constant';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { getReferenceLabel } from '@/common/modules/widgets/_helpers/widget-date-helper';

import { gray } from '@/styles/colors';
import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import {
    COST_REPORT_GROUP_BY_ITEM_MAP,
    GROUP_BY,
} from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';


type CostReportDataAnalyzeResult = {
    [groupBy: string]: string | any;
    value_sum: number;
};

const OTHER_CATEGORY = 'Others';
const chartContext = ref<HTMLElement|null>(null);
const costReportPageStore = useCostReportPageStore();
const costReportPageState = costReportPageStore.state;
const costReportPageGetters = costReportPageStore.getters;
const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
});
const state = reactive({
    loading: true,
    data: undefined as AnalyzeResponse<CostReportDataAnalyzeResult>|undefined,
    targetSelectItems: computed(() => ([
        { name: GROUP_BY.WORKSPACE_NAME, label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.WORKSPACE') },
        { name: GROUP_BY.PROVIDER, label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.PROVIDER') },
    ] as SelectButtonType[])),
    selectedTarget: storeState.isAdminMode ? GROUP_BY.WORKSPACE_NAME : GROUP_BY.PROVIDER,
    totalAmount: computed(() => sum(state.data?.results.map((d) => d.value_sum))),
    currentDate: undefined as Dayjs | undefined,
    currentDateRangeText: computed<string>(() => {
        if (!state.currentDate) return '';
        return `${state.currentDate.startOf('month').format('YYYY-MM-DD')} ~ ${state.currentDate.endOf('month').format('YYYY-MM-DD')}`;
    }),
    currentReportId: undefined as string|undefined,
    //
    chart: null as EChartsType | null,
    chartData: [],
    chartOptions: computed<PieSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        grid: {
            containLabel: true,
        },
        tooltip: {
            trigger: 'item',
            position: 'inside',
            formatter: (params) => {
                const _name = getReferenceLabel(storeState.allReferenceTypeInfo, state.selectedTarget, params.name);
                const _value = numberFormatter(params.value) || '';
                return `${params.marker} ${_name}: <b>${_value}</b>`;
            },
        },
        legend: {
            show: false,
        },
        series: [
            {
                type: 'pie',
                radius: ['30%', '70%'],
                center: ['30%', '50%'],
                data: state.chartData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
                avoidLabelOverlap: false,
                label: {
                    show: false,
                },
            },
        ],
    })),
    tableFields: computed<DataTableFieldType[]>(() => ([
        { name: state.selectedTarget, label: COST_REPORT_GROUP_BY_ITEM_MAP[state.selectedTarget].label },
        { name: 'value_sum', label: 'Amount', textAlign: 'right' },
    ])),
});

/* Util */
const getRefinedAnalyzeData = (res: AnalyzeResponse<CostReportDataAnalyzeResult>): AnalyzeResponse<CostReportDataAnalyzeResult> => {
    const _results: CostReportDataAnalyzeResult[] = [];
    const _totalAmount = sumBy(res.results, 'value_sum');
    const _thresholdValue = _totalAmount * 0.02;
    let _othersValueSum = 0;
    res.results?.forEach((d) => {
        if (d.value_sum < _thresholdValue) {
            _othersValueSum += d.value_sum;
        } else {
            _results.push(d);
        }
    });
    if (_othersValueSum > 0) {
        _results.push({
            [state.selectedTarget]: OTHER_CATEGORY,
            value_sum: _othersValueSum,
        });
    }
    return {
        more: res.more,
        results: _results,
    };
};
const getLegendColor = (field: string, value: string, rowIndex: number) => {
    if (value === OTHER_CATEGORY) return gray[500];
    if (field === GROUP_BY.WORKSPACE_NAME) {
        return MASSIVE_CHART_COLORS[rowIndex];
    }
    return storeState.providers[value]?.color ?? MASSIVE_CHART_COLORS[rowIndex];
};

/* Api */
const analyzeCostReportData = debounce(async () => {
    state.loading = true;
    try {
        const _period = {
            start: state.currentDate?.format('YYYY-MM'),
            end: state.currentDate?.format('YYYY-MM'),
        };
        const res = await SpaceConnector.clientV2.costAnalysis.costReportData.analyze<CostReportDataAnalyzeParameters, AnalyzeResponse<CostReportDataAnalyzeResult>>({
            cost_report_config_id: costReportPageState.costReportConfig?.cost_report_config_id,
            is_confirmed: true,
            query: {
                group_by: [state.selectedTarget],
                start: _period.start,
                end: _period.end,
                fields: {
                    value_sum: {
                        key: `cost.${costReportPageGetters.currency}`,
                        operator: 'sum',
                    },
                },
                sort: [{
                    key: 'value_sum',
                    desc: true,
                }],
            },
        });
        state.data = getRefinedAnalyzeData(res);
    } catch (e) {
        state.data = {};
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
}, 300);
const listCostReport = async () => {
    try {
        const res = await SpaceConnector.clientV2.costAnalysis.costReport.list<CostReportListParameters, ListResponse<CostReportModel>>({
            query: {
                filter: [
                    { k: 'report_month', v: state.currentDate?.format('YYYY-MM'), o: 'eq' },
                ],
            },
            status: 'SUCCESS',
        });
        if (res.results?.length) state.currentReportId = res.results[0].cost_report_id;
        else state.currentReportId = undefined;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.currentReportId = undefined;
    }
};

/* Util */
const drawChart = (rawData: AnalyzeResponse<CostReportDataAnalyzeResult>) => {
    if (isEmpty(rawData)) return;

    const _seriesData: any[] = [];
    rawData.results?.forEach((d) => {
        let _color = state.selectedTarget === 'provider' ? storeState.providers[d[state.selectedTarget]]?.color : undefined;
        if (d[state.selectedTarget] === OTHER_CATEGORY) _color = gray[500];
        _seriesData.push({
            name: d[state.selectedTarget],
            value: d.value_sum,
            itemStyle: {
                color: _color,
            },
        });
    });
    state.chartData = _seriesData;

    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
};

/* Event */
const handleChangeTarget = (target: string) => {
    state.selectedTarget = target;
    analyzeCostReportData();
};
const handleClickDetailsLink = async () => {
    try {
        const reportUrl = await costReportPageStore.getCostReportUrl({
            cost_report_id: state.currentReportId,
        });
        window.open(reportUrl, '_blank');
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};
const handleChangeDate = (date: Dayjs) => {
    state.currentDate = date;
    analyzeCostReportData();
};

/* Watcher */
watch([() => chartContext.value, () => state.loading, () => state.data], async ([_chartContext, loading, data]) => {
    if (_chartContext && !loading) {
        drawChart(data);
    }
});
watch(() => costReportPageState.recentReportMonth, async (after) => {
    if (!after) return;
    state.currentDate = dayjs.utc(after);
}, { immediate: true });
watch([
    () => costReportPageGetters.currency,
    () => () => costReportPageState.costReportConfig?.cost_report_config_id,
], ([_currency, _cost_report_config_id]) => {
    if (!_currency || !_cost_report_config_id) return;
    analyzeCostReportData();
}, { immediate: true });
watch(() => state.currentDate, () => {
    if (state.currentDate) listCostReport();
}, { immediate: true });
useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
</script>

<template>
    <cost-report-overview-card-template display-block-in-mobile>
        <template #title>
            <span class="title">
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.MONTHLY_TOTAL_AMOUNT_SUMMARY') }}
            </span>
        </template>
        <template v-if="storeState.isAdminMode"
                  #right-extra
        >
            <div class="select-button-wrapper">
                <p-select-button v-for="item in state.targetSelectItems"
                                 :key="`cost-trend-select-button-${item.name}`"
                                 :value="item.name"
                                 :selected="state.selectedTarget"
                                 size="sm"
                                 style-type="secondary"
                                 @change="handleChangeTarget"
                >
                    {{ item.label }}
                </p-select-button>
            </div>
        </template>
        <template #content>
            <p-data-loader :loading="state.loading"
                           :data="state.data"
                           :min-loading-time="500"
            >
                <div class="grid grid-cols-12 gap-4">
                    <div class="left-part">
                        <p-date-pagination :date="state.currentDate"
                                           :disable-next-button="state.currentDate?.isSame(dayjs.utc(costReportPageState.recentReportMonth), 'month')"
                                           @update:date="handleChangeDate"
                        />
                        <div class="date-range-text">
                            {{ state.currentDateRangeText }}
                        </div>
                        <div class="summary-wrapper">
                            <div class="summary-label">
                                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.TOTAL_AMOUNT') }}
                            </div>
                            <div class="summary-value">
                                <span class="currency-symbol">{{ CURRENCY_SYMBOL?.[costReportPageGetters.currency] }}</span>
                                <span class="value">{{ currencyMoneyFormatter(state.totalAmount, { currency: costReportPageGetters.currency, style: 'decimal' }) }}</span>
                            </div>
                        </div>
                        <p-text-button v-if="!storeState.isAdminMode && state.currentReportId"
                                       style-type="highlight"
                                       class="report-link"
                                       size="md"
                                       @click="handleClickDetailsLink"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.SEE_DETAILS') }}
                            <p-i name="ic_arrow-right-up"
                                 class="link-mark"
                                 height="0.875rem"
                                 width="0.875rem"
                                 color="inherit"
                            />
                        </p-text-button>
                        <div class="chart-wrapper">
                            <div ref="chartContext"
                                 class="chart"
                            />
                        </div>
                    </div>
                    <div class="right-part">
                        <p-data-table :fields="state.tableFields"
                                      :items="state.data?.results ?? []"
                                      :loading="state.loading"
                                      table-style-type="simple"
                                      class="summary-data-table"
                        >
                            <template #col-format="{field, value, rowIndex}">
                                <span v-if="field.name === GROUP_BY.WORKSPACE_NAME">
                                    <span class="toggle-button"
                                          :style="{ 'background-color': getLegendColor(field.name, value, rowIndex) }"
                                    />
                                    <p-tooltip :contents="storeState.workspaces[value] ? storeState.workspaces[value].label : value"
                                               position="bottom"
                                    >
                                        {{ storeState.workspaces[value] ? storeState.workspaces[value].label : value }}
                                    </p-tooltip>
                                </span>
                                <span v-else-if="field.name === GROUP_BY.PROVIDER">
                                    <span class="toggle-button"
                                          :style="{ 'background-color': getLegendColor(field.name, value, rowIndex) }"
                                    />
                                    <p-tooltip :contents="storeState.providers[value] ? storeState.providers[value].name : value"
                                               position="bottom"
                                    >
                                        {{ storeState.providers[value] ? storeState.providers[value].name : value }}
                                    </p-tooltip>
                                </span>
                            </template>
                            <template #col-value_sum-format="{ value }">
                                <p-tooltip :contents="currencyMoneyFormatter(value, { currency: costReportPageGetters.currency }) ?? ''"
                                           position="bottom"
                                >
                                    <span v-if="costReportPageGetters.currency"
                                          class="amount-col"
                                    >
                                        {{ currencyMoneyFormatter(value, { currency: costReportPageGetters.currency }) }}
                                    </span>
                                </p-tooltip>
                            </template>
                        </p-data-table>
                    </div>
                </div>
            </p-data-loader>
        </template>
    </cost-report-overview-card-template>
</template>

<style lang="postcss" scoped>
.select-button-wrapper {
    display: flex;
    gap: 0.25rem;
    padding-top: 0.5rem;
}
.left-part {
    @apply col-span-12;

    @screen lg {
        grid-column: span 6 / span 6;
    }

    .date-range-text {
        @apply text-label-md text-gray-500;
    }
    .summary-wrapper {
        padding-top: 1rem;
        padding-bottom: 0.5rem;
        .summary-label {
            @apply text-label-md text-gray-600;
            padding-bottom: 0.25rem;
        }
        .currency-symbol {
            @apply text-label-xl text-gray-600;
        }
        .value {
            @apply text-display-md;
            font-weight: 700;
            padding-left: 0.125rem;
        }
    }
    .chart-wrapper {
        padding-top: 0.5rem;
        height: 12rem;
        position: relative;

        .chart-skeleton {
            position: absolute;
            top: 0;
            z-index: 3;
            height: 100%;
        }

        .chart {
            width: 100%;
            height: 100%;
        }
    }
}
.right-part {
    @apply col-span-12;

    @screen lg {
        grid-column: span 6 / span 6;
    }

    .amount-col {
        @apply text-label-md;
        font-weight: 500;
    }
    .toggle-button {
        @apply rounded-full;
        display: inline-block;
        width: 0.5rem;
        height: 0.5rem;
        margin-right: 0.5rem;
    }
    .summary-data-table {
        max-height: 19rem;
    }
}

/* custom design-system component - p-data-table */
:deep(.summary-data-table) {
    table {
        width: 100%;
    }
    td {
        @apply truncate;
        width: 100%;
    }
}

/* custom design-system component - p-date-pagination */
:deep(.p-date-pagination) {
    .date-text {
        @apply text-display-md;
    }
}
</style>
