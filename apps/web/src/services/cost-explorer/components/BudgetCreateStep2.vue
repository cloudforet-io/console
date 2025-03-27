<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import {
    PFieldGroup, PSelectDropdown, PDatetimePicker, PButton, PDivider, PRadioGroup, PRadio, PPaneLayout, PTextInput, PBadge,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/display/constant';
import { useDomainStore } from '@/store/domain/domain-store';

import type { UnifiedCostConfig } from '@/services/advanced/types/preferences-type';

import { DEFAULT_UNIFIED_COST_CURRENCY, YAHOO_FINANCE_ID } from '../constants/cost-explorer-constant';
import BudgetLastThreeMonthCostTrendBarChart from '../pages/BudgetLastThreeMonthCostTrendBarChart.vue';
import { useBudgetCreatePageStore } from '../stores/budget-create-page-store';

const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;
const domainStore = useDomainStore();
const domainState = domainStore.state;

const originUnifiedCostConfig = computed<UnifiedCostConfig|undefined>(() => domainState.config?.settings?.unified_cost_config);

const state = reactive({
    selectedCurrency: originUnifiedCostConfig.value?.currency ?? DEFAULT_UNIFIED_COST_CURRENCY,
    exchangeRateSourceOptions: [YAHOO_FINANCE_ID],
    selectedExchangeRateSource: originUnifiedCostConfig.value?.exchange_source ?? YAHOO_FINANCE_ID,
    startMonth: [],
    endMonth: [],
    budgetCycleList: [
        { name: 'fixedTerm', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.FIXED_TERM') },
        { name: 'monthly', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.MONTHLY') },
    ],
    selectedBudgetCycle: '',
    monthlyBudgetAllocationList: [
        { name: 'applySameAmount', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.APPLY_THE_SAME_AMOUNT') },
        { name: 'increaseBySpecificPercentage', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.INCRASE_BY_SPECIFIC_PERCENTAGE') },
        { name: 'enterManually', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.ENTER_MANUALLY') },
    ],
    selectedMonthlyBudgetAllocation: '',
    isContineAble: false,
    tempArr: Array(12),
    dateList: Array.from({ length: 12 }, (_, i) => dayjs(`${dayjs.utc().year()}-01-01`).add(i, 'month').format('MMM YYYY')),
    budgetEachDate: Array(12).fill(''),
    budgetAmount: undefined as number | undefined,
    budgetAppliedSameAmount: undefined,
});

const emit = defineEmits<{(e: 'click-next'): void}>();

watch(() => state, () => {
    budgetCreatePageStore.setCurrency(state.selectedCurrency);
    budgetCreatePageStore.setStart(state.startMonth[0]);
    budgetCreatePageStore.setEnd(state.endMonth[0]);
    budgetCreatePageStore.setTimeUnit(state.selectedBudgetCycle);
    if (state.selectedBudgetCycle === 'fixedTerm' && state.budgetAmount) budgetCreatePageStore.setLimit(state.budgetAmount);
}, { deep: true, immediate: true });

watch(() => state, () => {
    if (state.selectedMonthlyBudgetAllocation === 'applySameAmount') {
        const planned_limits: any = [];
        const startDate = dayjs.utc(budgetCreatePageState.startMonth);
        const endDate = dayjs.utc(budgetCreatePageState.endMonth);
        let currentDate = startDate;

        while (currentDate.isSameOrBefore(endDate, 'month')) {
            planned_limits.push({
                date: currentDate.format('YYYY-MM'),
                limit: state.budgetAppliedSameAmount,
            });
            currentDate = currentDate.add(1, 'month');
        }
        budgetCreatePageStore.setPlannedLimits(planned_limits);
    }
}, { deep: true, immediate: true });


const handlePrevious = () => {
    budgetCreatePageStore.setCurrentStep(1);
};

const handleUpdateBudgetAmount = (value) => {
    state.budgetAmount = value;
};

const handleUpdatgeBudgetEachDate = (value: string, index: number) => {
    state.budgetEachDate[index] = value;
};

const handleUpdateBudgetAppliedSameAmount = (value) => {
    state.budgetAppliedSameAmount = value;
};
</script>

<template>
    <div class="flex flex-col">
        <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.CURRENCY')"
                       required
                       icon-right="ic_info-circle"
        >
            <p-select-dropdown :menu="Object.values(CURRENCY).map(currency => ({ label: `${CURRENCY_SYMBOL[currency]} ${currency}`, name: currency }))"
                               :selected.sync="state.selectedCurrency"
                               use-fixed-menu-style
            >
                <template #menu-item--format="{item}">
                    <div v-if="item.name === originUnifiedCostConfig?.currency">
                        <span>{{ item.label }}</span>
                        <p-badge badge-type="subtle"
                                 style-type="indigo100"
                                 class="ml-1"
                        >
                            Default
                        </p-badge>
                    </div>
                </template>
            </p-select-dropdown>
        </p-field-group>
        <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.EXCHANGE_RATE_SOURCE')"
                       required
        >
            <p-radio-group direction="vertical">
                <p-radio v-for="source in state.exchangeRateSourceOptions"
                         :key="source"
                         v-model="state.selectedExchangeRateSource"
                         :value="source"
                >
                    {{ source }}
                </p-radio>
            </p-radio-group>
        </p-field-group>
        <div class="flex gap-8">
            <div class="left-section">
                <p-divider />
                <div class="flex gap-6 mt-6">
                    <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.START_MONTH')"
                                   required
                    >
                        <p-datetime-picker data-type="yearToMonth"
                                           :selected-dates.sync="state.startMonth"
                                           :placeholder="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SELECT_MONTH')"
                                           :max-date="dayjs.utc().format('YYYY-MM')"
                        />
                    </p-field-group>
                    <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.END_MONTH')"
                                   required
                    >
                        <p-datetime-picker data-type="yearToMonth"
                                           :selected-dates.sync="state.endMonth"
                                           :placeholder="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SELECT_MONTH')"
                                           :max-date="dayjs.utc().format('YYYY-MM')"
                                           :min-date="state.startMonth.length > 0 ? dayjs.utc(state.startMonth[0]).format('YYYY-MM') : dayjs.utc().format('YYYY-MM')"
                        />
                    </p-field-group>
                </div>
                <div class="flex">
                    <p-field-group
                        :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_CYCLE')"
                        :help-text="state.startMonth.length === 0 || state.endMonth.length === 0 ? $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_CYCLE_DESCRIPTION') : ''"
                        required
                    >
                        <p-radio-group direction="vertical">
                            <p-radio v-for="(cycle, idx) in state.budgetCycleList"
                                     :key="`budget-cycle-${idx}`"
                                     v-model="state.selectedBudgetCycle"
                                     :value="cycle.name"
                                     :disabled="!budgetCreatePageState.startMonth && !budgetCreatePageState.endMonth"
                            >
                                <span>{{ cycle.label }}</span>
                            </p-radio>
                        </p-radio-group>
                    </p-field-group>
                </div>
                <p-pane-layout v-if="state.selectedBudgetCycle.length > 0"
                               class="cycle-info-layout"
                >
                    <div v-if="state.selectedBudgetCycle === 'fixedTerm'"
                         class="ml-6 mt-2"
                    >
                        <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_AMOUNT')"
                                       required
                                       class="p-4"
                        >
                            <p-text-input :value="budgetCreatePageState.limit"
                                          @update:value="handleUpdateBudgetAmount"
                            >
                                <template #input-right>
                                    ({{ CURRENCY_SYMBOL[state.selectedCurrency] }})
                                </template>
                            </p-text-input>
                        </p-field-group>
                    </div>
                    <div v-else-if="state.selectedBudgetCycle === 'monthly'"
                         class="ml-6 mt-2"
                    >
                        <div class="allocation-layout">
                            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.MONTHLY_BUDGET_ALLOCATION')"
                                           required
                                           class="p-4"
                            >
                                <p-radio-group direction="vertical"
                                               class="flex flex-col"
                                >
                                    <p-radio v-for="(allocation, idx) in state.monthlyBudgetAllocationList"
                                             :key="`budget-allocation-${idx}`"
                                             v-model="state.selectedMonthlyBudgetAllocation"
                                             :value="allocation.name"
                                    >
                                        <span>{{ allocation.label }}</span>
                                    </p-radio>
                                </p-radio-group>
                            </p-field-group>
                            <p-text-input v-if="state.selectedMonthlyBudgetAllocation === 'applySameAmount'"
                                          class="ml-4"
                                          :value="state.budgetAppliedSameAmount"
                                          @update:value="handleUpdateBudgetAppliedSameAmount"
                            >
                                <template #input-right>
                                    ({{ CURRENCY_SYMBOL[state.selectedCurrency] }})
                                </template>
                            </p-text-input>
                            <div v-else-if="state.selectedMonthlyBudgetAllocation === 'increaseBySpecificPercentage'"
                                 class="flex gap-6 mt-1 ml-4"
                            >
                                <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.INITIAL_AMOUNT')"
                                               style-type="secondary"
                                               required
                                >
                                    <p-text-input>
                                        <template #input-right>
                                            ({{ CURRENCY_SYMBOL[state.selectedCurrency] }})
                                        </template>
                                    </p-text-input>
                                </p-field-group>
                                <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.MONTHLY_GROWTH_RATE')"
                                               style-type="secondary"
                                               required
                                >
                                    <p-text-input>
                                        <template #input-right>
                                            %
                                        </template>
                                    </p-text-input>
                                </p-field-group>
                            </div>
                            <div v-else-if="state.selectedMonthlyBudgetAllocation === 'enterManually'"
                                 class="allocation-enter-manually"
                            >
                                <p-field-group v-for="(date, i) in state.dateList"
                                               :key="i"
                                               :label="date"
                                               required
                                >
                                    <p-text-input :value="state.budgetEachDate[i]"
                                                  @update:value="(value) => handleUpdatgeBudgetEachDate(value, i)"
                                    >
                                        <template #input-right>
                                            ({{ CURRENCY_SYMBOL[state.selectedCurrency] }})
                                        </template>
                                    </p-text-input>
                                </p-field-group>
                            </div>
                        </div>
                    </div>
                </p-pane-layout>
            </div>
            <div class="right-section">
                <budget-last-three-month-cost-trend-bar-chart />
            </div>
        </div>
        <div class="mt-8 flex justify-end gap-4">
            <p-button style-type="transparent"
                      @click="handlePrevious"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PREVIOUS') }}
            </p-button>
            <p-button @click="emit('click-next')">
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.CONTINUE') }}
            </p-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    width: 15rem;
}

/* :deep(.p-text-input) {
    width: 94px;
} */

.allocation-layout {
    min-width: 500px;
}

.cycle-info-layout {
    min-width: 600px;
    min-height: 400px;
}

.allocation-enter-manually {
    @apply grid grid-cols-4 grid-rows-3 mt-1 ml-6;
    .p-text-input {
        width: 94px;
    }
}
</style>
