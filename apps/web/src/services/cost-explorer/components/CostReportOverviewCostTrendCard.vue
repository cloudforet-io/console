<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';

import {
    PSelectButton, PCollapsibleToggle, PDataTable, PSelectDropdown,
} from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/src/data-display/tables/data-table/type';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import dayjs from 'dayjs';

import { numberFormatter } from '@cloudforet/utils';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';


const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const costReportPageStore = useCostReportPageStore();
const costReportPageGetters = costReportPageStore.getters;
const state = reactive({
    dateSelectDropdown: computed<SelectDropdownMenuItem[]>(() => {
        const _defaultStart = costReportPageGetters.recentReportDate.subtract(11, 'month').format('YYYY-MM');
        const _defaultEnd = costReportPageGetters.recentReportDate.format('YYYY-MM');
        const _default: SelectDropdownMenuItem = {
            name: 'last12Months', label: `Last 12 Months (${_defaultStart} ~ ${_defaultEnd})`,
        };
        const last3Years = Array.from({ length: 3 }).map((_, idx) => {
            const _year = costReportPageGetters.recentReportDate.subtract(idx, 'year').format('YYYY');
            return {
                name: _year, label: `${_year} (${_year}-01 ~ 12)`,
            };
        });
        return [_default, ...last3Years];
    }),
    selectedDate: 'last12Months',
    targetSelectItems: [
        { name: 'workspace', label: 'Workspace' },
        { name: 'provider', label: 'Provider' },
    ],
    selectedTarget: 'workspace',
    previousTotalAmount: 957957,
    last12MonthsAverage: 726568,
    //
    isDetailsCollapsed: true,
    chartData: [],
    tableFields: computed<DataTableFieldType[]>(() => {
        const targetField = state.targetSelectItems.find((item) => item.name === state.selectedTarget) ?? {};

        const today = dayjs.utc();
        const fields: DataTableFieldType[] = [];
        let idx = 0;
        Array.from({ length: 12 }).forEach(() => {
            const month = today.subtract(idx, 'month');
            fields.push({
                name: month.format('YYYY-MM'),
                label: month.format('MMM'),
                textAlign: 'right',
                sortable: false,
            });
            idx += 1;
        });
        return [targetField, ...fields];
    }),
    tableItems: [],
});

/* Util */
const drawChart = () => {
    chartHelper.refreshRoot();
    // const { chart, xAxis, yAxis } = chartHelper.createXYDateChart();
    //
    // // set base interval of xAxis
    // xAxis.get('baseInterval').timeUnit = 'month';
    //
    // // set label adapter of yAxis
    // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // // @ts-ignore
    // yAxis.get('renderer').remove('labels');
};

/* Event */
const handleChangeTarget = (target: string) => {
    state.selectedTarget = target;
};

/* Watcher */
watch([() => state.loading, () => chartContext.value], async ([loading, _chartContext]) => {
    if (!loading && _chartContext) drawChart();
}, { immediate: true });
</script>

<template>
    <cost-report-overview-card-template>
        <template #title>
            <span class="mr-3">
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.COST_TREND') }}
            </span>
            <p-select-dropdown style-type="transparent"
                               :menu="state.dateSelectDropdown"
                               :selected="state.selectedDate"
            />
        </template>
        <template #right-extra>
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
            <div class="summary-wrapper">
                <div class="summary-item">
                    <div class="summary-label">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.PREVIOUS_TOTAL_AMOUNT') }}
                    </div>
                    <div class="summary-value">
                        <span class="currency-symbol">₩</span>
                        <span class="value">{{ numberFormatter(state.previousTotalAmount) }}</span>
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.LAST_12_MONTHS_AVERAGE') }}
                    </div>
                    <div class="summary-value">
                        <span class="currency-symbol">₩</span>
                        <span class="value">{{ numberFormatter(state.last12MonthsAverage) }}</span>
                    </div>
                </div>
            </div>
            <div ref="chartContext"
                 class="chart"
            />
            <div v-if="!state.isDetailsCollapsed">
                <p-data-table :fields="state.tableFields"
                              :items="state.tableItems"
                />
            </div>
            <p-collapsible-toggle :is-collapsed.sync="state.isDetailsCollapsed"
                                  class="collapsible-toggle"
            >
                {{ state.isDetailsCollapsed ? $t('BILLING.COST_MANAGEMENT.COST_REPORT.SHOW_DETAILS') : $t('BILLING.COST_MANAGEMENT.COST_REPORT.HIDE') }}
            </p-collapsible-toggle>
        </template>
    </cost-report-overview-card-template>
</template>

<style lang="postcss" scoped>
.select-button-wrapper {
    display: flex;
    gap: 0.25rem;
}
.summary-wrapper {
    display: flex;
    gap: 1.5rem;
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
.chart {
    height: 17rem;
    width: 100%;
}
.collapsible-toggle {
    width: 100%;
    justify-content: center;
}

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .p-context-menu-item {
        font-weight: normal;
    }
}
</style>
