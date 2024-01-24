<script lang="ts" setup>
import { reactive, ref } from 'vue';

import {
    PSelectButton, PDatePagination, PLink,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import dayjs from 'dayjs';

import { numberFormatter } from '@cloudforet/utils';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import type { Field } from '@/services/dashboards/widgets/_types/widget-data-table-type';


const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    loading: false,
    targetSelectItems: [
        { name: 'workspace', label: 'Workspace' },
        { name: 'provider', label: 'Provider' },
    ],
    selectedTarget: 'workspace',
    totalAmount: 957957,
    date: dayjs.utc(),
    tableFields: [
        { name: 'workspace', label: 'Workspace' },
        { name: 'amount', label: 'Amount' },
    ] as Field[],
    tableItems: [],
});

/* Event */
const handleChangeTarget = (target: string) => {
    state.selectedTarget = target;
};
</script>

<template>
    <cost-report-overview-card-template>
        <template #title>
            <span class="title">
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.MONTHLY_TOTAL_AMOUNT_SUMMARY') }}
            </span>
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
            <div class="grid grid-cols-12">
                <div class="col-span-12 lg:col-span-6">
                    <p-date-pagination :date.sync="state.date" />
                    <div class="summary-wrapper">
                        <div class="summary-label">
                            {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.TOTAL_AMOUNT') }}
                        </div>
                        <div class="summary-value">
                            <span class="currency-symbol">₩</span>
                            <span class="value">{{ numberFormatter(state.totalAmount) }}</span>
                        </div>
                    </div>
                    <p-link :action-icon="ACTION_ICON.EXTERNAL_LINK"
                            to="/"
                            new-tab
                            highlight
                            size="sm"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.SEE_DETAILS') }}
                    </p-link>
                </div>
                <div class="col-span-12 lg:col-span-6" />
            </div>
            <div ref="chartContext"
                 class="chart"
            />
            차아트
        </template>
    </cost-report-overview-card-template>
</template>

<style lang="postcss" scoped>
.select-button-wrapper {
    display: flex;
    gap: 0.25rem;
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
.chart {
    height: 11rem;
}

/* custom design-system component - p-date-pagination */
:deep(.p-date-pagination) {
    .date-text {
        @apply text-display-md;
    }
}
</style>
