<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { PSelectButton } from '@spaceone/design-system';

import { numberFormatter } from '@cloudforet/utils';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';


const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    targetSelectItems: [
        { name: 'workspace', label: 'Workspace' },
        { name: 'provider', label: 'Provider' },
    ],
    selectedTarget: 'workspace',
    previousTotalAmount: 957957,
    last12MonthsAverage: 726568,
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
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.COST_TREND') }}
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
    padding-top: 1.5rem;
    height: 17rem;
}
</style>
