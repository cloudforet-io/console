<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';

import {
    PSelectButton, PDatePagination, PDataTable, PSkeleton, PTextButton, PI,
} from '@spaceone/design-system';
import type { SelectButtonType } from '@spaceone/design-system/types/inputs/buttons/select-button-group/type';
import type { Dayjs } from 'dayjs';
import { cloneDeep, debounce, sum } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostReportDataAnalyzeParameters } from '@/schema/cost-analysis/cost-report-data/api-verbs/analyze';
import type { CostReportListParameters } from '@/schema/cost-analysis/cost-report/api-verbs/list';
import type { CostReportModel } from '@/schema/cost-analysis/cost-report/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { white } from '@/styles/colors';
import { DEFAULT_CHART_COLORS } from '@/styles/colorsets';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import { GROUP_BY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';
import type { Field } from '@/services/dashboards/widgets/_types/widget-data-table-type';


interface ChartData {
    category: string;
    value: number;
    pieSettings: {
        fill: string;
    };
}
type CostReportDataAnalyzeResult = {
    [groupBy: string]: string | any;
    date: string;
    value_sum: number;
};

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const costReportPageStore = useCostReportPageStore();
const costReportPageGetters = costReportPageStore.getters;
const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});
const state = reactive({
    loading: true,
    data: undefined as AnalyzeResponse<CostReportDataAnalyzeResult>|undefined,
    targetSelectItems: computed(() => ([
        { name: GROUP_BY.WORKSPACE, label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.WORKSPACE') },
        { name: GROUP_BY.PROVIDER, label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.PROVIDER') },
    ] as SelectButtonType[])),
    selectedTarget: storeState.isAdminMode ? GROUP_BY.WORKSPACE : GROUP_BY.PROVIDER,
    totalAmount: computed(() => sum(state.data?.results.map((d) => d.value_sum))),
    currentDate: undefined as Dayjs | undefined,
    currentDateRangeText: computed<string>(() => {
        if (!state.currentDate) return '';
        return `${state.currentDate.startOf('month').format('YYYY-MM-DD')} ~ ${state.currentDate.endOf('month').format('YYYY-MM-DD')}`;
    }),
    currentReportId: undefined as string|undefined,
    //
    chartData: computed<ChartData[]>(() => state.data?.results?.map((d, idx) => {
        const _category = d[state.selectedTarget];
        const _categoryLabel = state.selectedTarget === GROUP_BY.WORKSPACE
            ? storeState.workspaces[_category]?.label ?? d.workspace_id
            : storeState.providers[_category]?.name ?? d.provider;
        const _color = state.selectedTarget === GROUP_BY.WORKSPACE
            ? DEFAULT_CHART_COLORS[idx]
            : storeState.providers[_category]?.color ?? DEFAULT_CHART_COLORS[idx];
        return {
            category: _categoryLabel,
            value: d.value_sum,
            pieSettings: {
                fill: _color,
            },
        };
    })),
    tableFields: computed<Field[]>(() => ([
        { name: state.selectedTarget, label: GROUP_BY_ITEM_MAP[state.selectedTarget].label },
        { name: 'value_sum', label: 'Amount', textAlign: 'right' },
    ])),
});

/* Api */
const analyzeCostReportData = debounce(async () => {
    state.loading = true;
    try {
        const _period = {
            start: state.currentDate?.format('YYYY-MM'),
            end: state.currentDate?.format('YYYY-MM'),
        };
        state.data = await SpaceConnector.clientV2.costAnalysis.costReportData.analyze<CostReportDataAnalyzeParameters>({
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
const drawChart = () => {
    chartHelper.refreshRoot();
    const chart = chartHelper.createDonutChart({
        paddingLeft: 20,
        paddingRight: 20,
        innerRadius: 40,
    });
    const seriesSettings = {
        categoryField: 'category',
        valueField: 'value',
    };
    const series = chartHelper.createPieSeries(seriesSettings);
    chart.series.push(series);
    series.slices.template.setAll({
        stroke: chartHelper.color(white),
        templateField: 'pieSettings',
    });
    const tooltip = chartHelper.createTooltip();
    chartHelper.setPieTooltipText(series, tooltip, costReportPageGetters.currency);
    series.slices.template.set('tooltip', tooltip);
    series.data.setAll(cloneDeep(state.chartData));
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

/* Init */
(async () => {
    await store.dispatch('reference/provider/load');
})();

/* Watcher */
watch([() => state.loading, () => chartContext.value], async ([loading, _chartContext]) => {
    if (!loading && _chartContext) drawChart();
}, { immediate: true });
watch(() => costReportPageGetters.recentReportDate, async (after, before) => {
    if (after.format('YYYY-MM') === before.format('YYYY-MM')) return;
    state.currentDate = after;
    await analyzeCostReportData();
}, { immediate: true });
watch(() => costReportPageGetters.currency, (_currency) => {
    if (_currency) analyzeCostReportData();
}, { immediate: true });
watch(() => state.currentDate, () => {
    listCostReport();
}, { immediate: true });
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
            <div class="grid grid-cols-12 gap-4">
                <div class="left-part">
                    <p-date-pagination :date.sync="state.currentDate"
                                       :disable-next-button="state.currentDate.isSame(costReportPageGetters.recentReportDate, 'month')"
                    />
                    <div class="date-range-text">
                        {{ state.currentDateRangeText }}
                    </div>
                    <div class="summary-wrapper">
                        <div class="summary-label">
                            {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.TOTAL_AMOUNT') }}
                        </div>
                        <p-skeleton v-if="state.loading"
                                    width="8rem"
                                    height="2rem"
                        />
                        <div v-else
                             class="summary-value"
                        >
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
                        <p-skeleton v-if="state.loading"
                                    height="100%"
                                    width="100%"
                        />
                        <div v-show="!state.loading"
                             ref="chartContext"
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
                            <span v-if="field.name === GROUP_BY.WORKSPACE">
                                <span class="toggle-button"
                                      :style="{ 'background-color': DEFAULT_CHART_COLORS[rowIndex] }"
                                />
                                {{ storeState.workspaces[value] ? storeState.workspaces[value].label : value }}
                            </span>
                            <span v-else-if="field.name === GROUP_BY.PROVIDER">
                                <span class="toggle-button"
                                      :style="{ 'background-color': storeState.providers[value]?.color ?? DEFAULT_CHART_COLORS[rowIndex] }"
                                />
                                {{ storeState.providers[value] ? storeState.providers[value].name : value }}
                            </span>
                        </template>
                        <template #col-value_sum-format="{ value }">
                            <span v-if="costReportPageGetters.currency"
                                  class="amount-col"
                            >
                                {{ currencyMoneyFormatter(value, { currency: costReportPageGetters.currency }) }}
                            </span>
                        </template>
                    </p-data-table>
                </div>
            </div>
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
        @apply col-span-6;
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
    }
    .chart {
        width: 100%;
        height: 100%;
    }
}
.right-part {
    @apply col-span-12;

    @screen lg {
        @apply col-span-6;
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

/* custom design-system component - p-date-pagination */
:deep(.p-date-pagination) {
    .date-text {
        @apply text-display-md;
    }
}
</style>
