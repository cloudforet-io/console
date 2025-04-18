<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import {
    PFieldGroup, PSelectDropdown, PDatetimePicker, PButton, PStatus,
    PDivider, PRadioGroup, PRadio, PPaneLayout, PTextInput, PBadge, PToggleButton,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/display/constant';
import { useDomainStore } from '@/store/domain/domain-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';

import type { UnifiedCostConfig } from '@/services/advanced/types/preferences-type';

import { DEFAULT_UNIFIED_COST_CURRENCY, YAHOO_FINANCE_ID } from '../constants/cost-explorer-constant';
import { useBudgetCreatePageStore } from '../stores/budget-create-page-store';
import BudgetLastThreeMonthCostTrendBarChart from './BudgetLastThreeMonthCostTrendBarChart.vue';

const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;
const domainStore = useDomainStore();
const domainState = domainStore.state;
const allReferenceStore = useAllReferenceStore();

const originUnifiedCostConfig = computed<UnifiedCostConfig|undefined>(() => domainState.config?.settings?.unified_cost_config);

const project = computed<ProjectReferenceMap>(() => allReferenceStore.getters.project);
const serviceAccount = computed<ServiceAccountReferenceMap>(() => allReferenceStore.getters.serviceAccount);

const state = reactive({
    selectedCurrency: originUnifiedCostConfig.value?.currency ?? DEFAULT_UNIFIED_COST_CURRENCY,
    exchangeRateSourceOptions: [YAHOO_FINANCE_ID],
    selectedExchangeRateSource: originUnifiedCostConfig.value?.exchange_source ?? YAHOO_FINANCE_ID,
    budgetCycleList: [
        { name: 'TOTAL', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.FIXED_TERM') },
        { name: 'MONTHLY', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.MONTHLY') },
    ],
    selectedBudgetCycle: '',
    monthlyBudgetAllocationList: [
        { name: 'applySameAmount', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.APPLY_THE_SAME_AMOUNT') },
        { name: 'increaseBySpecificPercentage', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.INCRASE_BY_SPECIFIC_PERCENTAGE') },
        { name: 'enterManually', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.ENTER_MANUALLY') },
    ],
    selectedMonthlyBudgetAllocation: '',
    isContinueAble: false,
    dateList: Array(12).fill(''),
    budgetEachDate: Array(12).fill(''),
    budgetAmount: undefined as number | undefined,
    budgetAppliedSameAmount: undefined,
    initialAmount: undefined,
    monthlyGrowthRate: undefined,
    analyzedCostData: undefined,
    startSelectedForBudgetYear: false,
    endSelectedForBudgetYear: false,
});

const emit = defineEmits<{(e: 'click-next'): void}>();

watch([() => state, () => budgetCreatePageState], () => {
    budgetCreatePageStore.setCurrency(state.selectedCurrency);
    budgetCreatePageStore.setTimeUnit(budgetCreatePageState.time_unit);
    if (budgetCreatePageState.time_unit === 'TOTAL' && state.budgetAmount) budgetCreatePageStore.setLimit(state.budgetAmount);
}, { deep: true, immediate: true });

watch(() => [budgetCreatePageState.startMonth, budgetCreatePageState.endMonth], () => {
    if (budgetCreatePageState.startMonth.length > 0) {
        const startDate = dayjs.utc(budgetCreatePageState.startMonth[0]);
        state.dateList = Array.from(
            { length: 12 },
            (_, i) => startDate.add(i, 'month').format('MMM YYYY'),
        );
        budgetCreatePageState.budgetEachDate = Array(12).fill('');
    }
}, { immediate: true });

watch(() => [
    budgetCreatePageState.selectedMonthlyBudgetAllocation,
    budgetCreatePageState.budgetAppliedSameAmount,
    budgetCreatePageState.initialAmount,
    budgetCreatePageState.monthlyGrowthRate,
    budgetCreatePageState.budgetEachDate,
    budgetCreatePageState.startMonth,
    budgetCreatePageState.endMonth,
], () => {
    if (budgetCreatePageState.startMonth.length === 0 || budgetCreatePageState.endMonth.length === 0) {
        return;
    }

    const planned_limits: any = [];
    const startDate = dayjs.utc(budgetCreatePageState.startMonth[0]);
    const endDate = dayjs.utc(budgetCreatePageState.endMonth[0]);
    let currentDate = startDate;

    if (budgetCreatePageState.selectedMonthlyBudgetAllocation === 'applySameAmount') {
        while (currentDate.isSameOrBefore(endDate, 'month') && budgetCreatePageState.budgetAppliedSameAmount
        && budgetCreatePageState.budgetAppliedSameAmount > 0) {
            planned_limits.push({
                date: currentDate.format('YYYY-MM'),
                limit: budgetCreatePageState.budgetAppliedSameAmount,
            });
            currentDate = currentDate.add(1, 'month');
        }
    } else if (budgetCreatePageState.selectedMonthlyBudgetAllocation === 'increaseBySpecificPercentage'
        && budgetCreatePageState.initialAmount && budgetCreatePageState.monthlyGrowthRate
    ) {
        let currentAmount = budgetCreatePageState.initialAmount;
        while (currentDate.isSameOrBefore(endDate, 'month')) {
            planned_limits.push({
                date: currentDate.format('YYYY-MM'),
                limit: Math.round(currentAmount),
            });
            currentAmount *= (1 + ((budgetCreatePageState.monthlyGrowthRate || 0) / 100));
            currentDate = currentDate.add(1, 'month');
        }
    } else if (budgetCreatePageState.selectedMonthlyBudgetAllocation === 'enterManually'
    && budgetCreatePageState.budgetEachDate.length === Number(endDate.month() - startDate.month() + 1)) {
        const monthIndices = Array.from({ length: 12 }, (_, i) => i);
        monthIndices.forEach((i) => {
            if (currentDate.isSameOrBefore(endDate, 'month')) {
                planned_limits.push({
                    date: currentDate.format('YYYY-MM'),
                    limit: Number(budgetCreatePageState.budgetEachDate[i]),
                });
                currentDate = currentDate.add(1, 'month');
            }
        });
    }

    if (planned_limits.length > 0) {
        budgetCreatePageStore.setPlannedLimits(planned_limits);
    }
}, { deep: true });

watch(() => [
    budgetCreatePageState.time_unit,
    budgetCreatePageState.limit,
    budgetCreatePageState.planned_limits,
    budgetCreatePageState.selectedMonthlyBudgetAllocation,
    budgetCreatePageState.budgetAppliedSameAmount,
    state.initialAmount,
    state.monthlyGrowthRate,
    budgetCreatePageState.budgetEachDate,
    state.startSelectedForBudgetYear,
    state.endSelectedForBudgetYear,
    budgetCreatePageState.startMonth,
    budgetCreatePageState.endMonth,
], () => {
    if (budgetCreatePageState.startMonth.length === 0 || budgetCreatePageState.endMonth.length === 0) {
        state.isContinueAble = false;
    }

    if (budgetCreatePageState.time_unit === 'TOTAL' && budgetCreatePageState.limit && budgetCreatePageState.limit > 0) {
        const isDuplicatedBudgetYear = (
            budgetCreatePageState.project
            && budgetCreatePageState.alreadyExistingBudgetYear.length > 0
            && (
                (state.startSelectedForBudgetYear && budgetCreatePageState.alreadyExistingBudgetYear.includes(budgetCreatePageState.budgetYear))
                || (state.endSelectedForBudgetYear && budgetCreatePageState.alreadyExistingBudgetYear.includes(budgetCreatePageState.budgetYear))
            )
        );

        if (isDuplicatedBudgetYear) {
            state.isContinueAble = false;
            return;
        }

        state.isContinueAble = true;
    } else if (budgetCreatePageState.time_unit === 'MONTHLY') {
        if (budgetCreatePageState.planned_limits && budgetCreatePageState.planned_limits.length > 0) {
            const isDuplicatedBudgetYear = (
                budgetCreatePageState.project
                && budgetCreatePageState.alreadyExistingBudgetYear.length > 0
                && (
                    (state.startSelectedForBudgetYear && budgetCreatePageState.alreadyExistingBudgetYear.includes(budgetCreatePageState.budgetYear))
                    || (state.endSelectedForBudgetYear && budgetCreatePageState.alreadyExistingBudgetYear.includes(budgetCreatePageState.budgetYear))
                )
            );

            if (isDuplicatedBudgetYear) {
                state.isContinueAble = false;
                return;
            }

            state.isContinueAble = true;
        } else {
            state.isContinueAble = false;
        }
    }
}, { deep: true, immediate: true });

watch(() => budgetCreatePageState.selectedMonthlyBudgetAllocation, (nv, ov) => {
    if (nv !== ov) {
        budgetCreatePageStore.setPlannedLimits([]);
        budgetCreatePageStore.setBudgetAppliedSameAmount(undefined);
        budgetCreatePageStore.setInitialAmount(undefined);
        budgetCreatePageStore.setMonthlyGrowthRate(undefined);
        budgetCreatePageState.budgetEachDate = [];
    }
}, { immediate: true });

watch([() => budgetCreatePageState.startMonth, () => budgetCreatePageState.endMonth], () => {
    if (budgetCreatePageState.startMonth.length > 0 || budgetCreatePageState.endMonth.length > 0) {
        if (budgetCreatePageState.startMonth.length > 0) {
            state.startSelectedForBudgetYear = true;
        } else if (budgetCreatePageState.endMonth.length > 0) {
            state.endSelectedForBudgetYear = true;
        }
    }
}, { deep: true, immediate: true });

watch([() => state.startSelectedForBudgetYear, () => state.endSelectedForBudgetYear, () => budgetCreatePageState.startMonth, () => budgetCreatePageState.endMonth], () => {

}, { deep: true, immediate: true });

const isDateInRange = (index: number) => {
    if (budgetCreatePageState.startMonth.length === 0 || budgetCreatePageState.endMonth.length === 0) return false;
    const startDate = dayjs.utc(budgetCreatePageState.startMonth[0]);
    const endDate = dayjs.utc(budgetCreatePageState.endMonth[0]);
    const currentDate = startDate.add(index, 'month');
    return currentDate.isSameOrBefore(endDate, 'month');
};

const handleUpdatgeBudgetEachDate = (value: string, index: number) => {
    if (!isDateInRange(index)) return;
    const newBudgetEachDate = [...budgetCreatePageState.budgetEachDate];
    newBudgetEachDate[index] = value;
    budgetCreatePageState.budgetEachDate = newBudgetEachDate;
};

const handlePrevious = () => {
    budgetCreatePageStore.setCurrentStep(1);
};

const handleUpdateBudgetAmount = (value) => {
    budgetCreatePageStore.setLimit(value);
};

const handleUpdateBudgetAppliedSameAmount = (value) => {
    budgetCreatePageStore.setBudgetAppliedSameAmount(value);
};

const handleUpdateInitialAmount = (value) => {
    budgetCreatePageStore.setInitialAmount(value);
};

const handleUpdateMonthlyGrowthRate = (value) => {
    budgetCreatePageStore.setMonthlyGrowthRate(value);
};

const handleUpdateStartSelectForBudgetYear = (value: boolean) => {
    state.startSelectedForBudgetYear = value;
    if (value) {
        state.endSelectedForBudgetYear = false;
    }
};

const handleUpdateEndSelectForBudgetYear = (value: boolean) => {
    state.endSelectedForBudgetYear = value;
    if (value) {
        state.startSelectedForBudgetYear = false;
    }
};

const isValidPositiveNumber = (value: any): boolean => {
    const num = Number(value);
    return value !== '' && !Number.isNaN(num) && num > 0;
};
watch([
    () => budgetCreatePageState.startMonth,
    () => budgetCreatePageState.endMonth,
    () => state.startSelectedForBudgetYear,
    () => state.endSelectedForBudgetYear,
], () => {
    if (budgetCreatePageState.startMonth.length > 0 && budgetCreatePageState.endMonth.length > 0) {
        const startYear = dayjs.utc(budgetCreatePageState.startMonth[0]).year().toString();
        const endYear = dayjs.utc(budgetCreatePageState.endMonth[0]).year().toString();

        if (startYear === endYear) {
            budgetCreatePageStore.setBudgetYear(startYear);
        } else if (state.startSelectedForBudgetYear) {
            budgetCreatePageStore.setBudgetYear(startYear);
        } else if (state.endSelectedForBudgetYear) {
            budgetCreatePageStore.setBudgetYear(endYear);
        }
    }
}, { immediate: true });

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
                            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.DEFAULT') }}
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
        <div class="bottom-section">
            <div class="left-section">
                <p-divider />
                <div class="flex gap-6 mt-6">
                    <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.START_MONTH')"
                                   required
                    >
                        <p-datetime-picker data-type="yearToMonth"
                                           :selected-dates.sync="budgetCreatePageState.startMonth"
                                           :min-date="budgetCreatePageState.endMonth.length > 0 ? dayjs.utc(budgetCreatePageState.endMonth[0]).subtract(11, 'month').format('YYYY-MM') : ''"
                                           :max-date="budgetCreatePageState.endMonth.length > 0 ? dayjs.utc(budgetCreatePageState.endMonth[0]).format('YYYY-MM'): ''"
                                           :placeholder="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SELECT_MONTH')"
                        />
                    </p-field-group>
                    <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.END_MONTH')"
                                   required
                    >
                        <p-datetime-picker data-type="yearToMonth"
                                           :selected-dates.sync="budgetCreatePageState.endMonth"
                                           :placeholder="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SELECT_MONTH')"
                                           :min-date="budgetCreatePageState.startMonth.length > 0
                                               ? dayjs.utc(budgetCreatePageState.startMonth[0]).add(1, 'month').format('YYYY-MM') : ''"
                                           :max-date="budgetCreatePageState.startMonth.length > 0 ? dayjs.utc(budgetCreatePageState.startMonth[0]).add(11, 'month').format('YYYY-MM') : ''"
                        />
                    </p-field-group>
                </div>
                <div class="flex gap-15 mb-6">
                    <div class="flex gap-1">
                        <p-toggle-button
                            :value="state.startSelectedForBudgetYear"
                            @update:value="handleUpdateStartSelectForBudgetYear"
                        />
                        <span class="text-sm font-normal"
                              :class="{'start-selected': state.startSelectedForBudgetYear, 'end-selected': !state.startSelectedForBudgetYear}"
                        >Base for 'period' filter</span>
                    </div>
                    <div class="flex gap-1">
                        <p-toggle-button
                            :value="state.endSelectedForBudgetYear"
                            @update:value="handleUpdateEndSelectForBudgetYear"
                        />
                        <span class="text-sm font-normal"
                              :class="{'start-selected': state.endSelectedForBudgetYear, 'end-selected': !state.endSelectedForBudgetYear}"
                        >Base for 'period' filter</span>
                    </div>
                </div>
                <p-status v-if="budgetCreatePageState.project
                              && budgetCreatePageState.alreadyExistingBudgetYear.length > 0
                              && (
                                  (state.startSelectedForBudgetYear && budgetCreatePageState.alreadyExistingBudgetYear.includes(budgetCreatePageState.budgetYear))
                                  ||
                                  (state.endSelectedForBudgetYear && budgetCreatePageState.alreadyExistingBudgetYear.includes(budgetCreatePageState.budgetYear))
                              )"
                          icon="ic_warning-filled"
                          :text="budgetCreatePageState.scope.type === 'project'
                              ? $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PROJECT_DUPLICATED_WARNING1', {
                                  project: project[budgetCreatePageState.project].name,
                                  year_list: budgetCreatePageState.alreadyExistingBudgetYear.join(',').split(' ')
                              }) : $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PROJECT_DUPLICATED_WARNING2', {
                                  project: project[budgetCreatePageState.project].name,
                                  serviceAccount: serviceAccount[budgetCreatePageState.scope.serviceAccount ?? ''].name,
                                  year_list: budgetCreatePageState.alreadyExistingBudgetYear.join(',')
                              })"
                          theme="red"
                          class="text-sm mb-6"
                />
                <div class="flex">
                    <p-field-group
                        :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_CYCLE')"
                        :help-text="budgetCreatePageState.startMonth.length === 0 || budgetCreatePageState.endMonth.length === 0
                            ? $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_CYCLE_DESCRIPTION') : ''"
                        required
                    >
                        <p-radio-group>
                            <p-radio v-for="(cycle, idx) in state.budgetCycleList"
                                     :key="`budget-cycle-${idx}`"
                                     v-model="budgetCreatePageState.time_unit"
                                     :value="cycle.name"
                                     :disabled="(budgetCreatePageState.startMonth.length === 0 || budgetCreatePageState.endMonth.length === 0 || budgetCreatePageState.project
                                         && budgetCreatePageState.alreadyExistingBudgetYear.length > 0
                                         && (
                                             (state.startSelectedForBudgetYear && budgetCreatePageState.alreadyExistingBudgetYear.includes(budgetCreatePageState.budgetYear))
                                             ||
                                             (state.endSelectedForBudgetYear && budgetCreatePageState.alreadyExistingBudgetYear.includes(budgetCreatePageState.budgetYear))
                                         ))"
                            >
                                <span>{{ cycle.label }}</span>
                            </p-radio>
                        </p-radio-group>
                    </p-field-group>
                </div>
                <p-pane-layout v-if="budgetCreatePageState.time_unit.length > 0"
                               class="cycle-info-layout"
                               :class="{'fixed-term-layout': budgetCreatePageState.time_unit === 'TOTAL'}"
                >
                    <div v-if="budgetCreatePageState.time_unit === 'TOTAL'"
                         class="pt-4 pl-4"
                    >
                        <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_AMOUNT')"
                                       required
                        >
                            <p-text-input :value="budgetCreatePageState.limit"
                                          :invalid="!isValidPositiveNumber(budgetCreatePageState.limit)"
                                          @update:value="handleUpdateBudgetAmount"
                            >
                                <template #input-right>
                                    ({{ CURRENCY_SYMBOL[state.selectedCurrency] }})
                                </template>
                            </p-text-input>
                        </p-field-group>
                    </div>
                    <div v-else-if="budgetCreatePageState.time_unit === 'MONTHLY'"
                         class="ml-2"
                    >
                        <div class="allocation-layout">
                            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.MONTHLY_BUDGET_ALLOCATION')"
                                           required
                                           class="pt-4"
                                           :disabled="budgetCreatePageState.startMonth.length === 0 || budgetCreatePageState.endMonth.length === 0"
                            >
                                <p-radio-group direction="vertical"
                                               class="flex flex-col"
                                >
                                    <p-radio v-for="(allocation, idx) in state.monthlyBudgetAllocationList"
                                             :key="`budget-allocation-${idx}`"
                                             v-model="budgetCreatePageState.selectedMonthlyBudgetAllocation"
                                             :value="allocation.name"
                                             :disabled="budgetCreatePageState.startMonth.length === 0 || budgetCreatePageState.endMonth.length === 0"
                                    >
                                        <span>{{ allocation.label }}</span>
                                    </p-radio>
                                </p-radio-group>
                            </p-field-group>
                            <p-pane-layout v-if="budgetCreatePageState.selectedMonthlyBudgetAllocation"
                                           class="monthly-text-layout"
                            >
                                <p-field-group v-if="budgetCreatePageState.selectedMonthlyBudgetAllocation === 'applySameAmount'"
                                               :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.AMOUNT_EACH_MONTH')"
                                               required
                                >
                                    <p-text-input :value="budgetCreatePageState.budgetAppliedSameAmount"
                                                  :invalid="!isValidPositiveNumber(budgetCreatePageState.budgetAppliedSameAmount)"
                                                  @update:value="handleUpdateBudgetAppliedSameAmount"
                                    >
                                        <template #input-right>
                                            ({{ CURRENCY_SYMBOL[state.selectedCurrency] }})
                                        </template>
                                    </p-text-input>
                                </p-field-group>
                                <div v-else-if="budgetCreatePageState.selectedMonthlyBudgetAllocation === 'increaseBySpecificPercentage'"
                                     class="increase-layout"
                                >
                                    <span class="text-md font-bold mb-1">Specific % Each Month</span>
                                    <div class="flex gap-6 mt-1">
                                        <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.INITIAL_AMOUNT')"
                                                       style-type="secondary"
                                                       required
                                        >
                                            <p-text-input :value="budgetCreatePageState.initialAmount"
                                                          :invalid="!isValidPositiveNumber(budgetCreatePageState.initialAmount)"
                                                          @update:value="handleUpdateInitialAmount"
                                            >
                                                <template #input-right>
                                                    ({{ CURRENCY_SYMBOL[state.selectedCurrency] }})
                                                </template>
                                            </p-text-input>
                                        </p-field-group>
                                        <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.MONTHLY_GROWTH_RATE')"
                                                       style-type="secondary"
                                                       required
                                        >
                                            <p-text-input :value="budgetCreatePageState.monthlyGrowthRate"
                                                          :invalid="!isValidPositiveNumber(budgetCreatePageState.monthlyGrowthRate)"
                                                          @update:value="handleUpdateMonthlyGrowthRate"
                                            >
                                                <template #input-right>
                                                    %
                                                </template>
                                            </p-text-input>
                                        </p-field-group>
                                    </div>
                                </div>
                                <div v-else-if="budgetCreatePageState.selectedMonthlyBudgetAllocation === 'enterManually'">
                                    <span class="text-xs mb-2">Enter each month manually.</span>
                                    <div class="allocation-enter-manually">
                                        <p-field-group v-for="(date, idx) in state.dateList"
                                                       :key="`budget-date-${idx}`"
                                                       :label="date"
                                                       required
                                        >
                                            <p-text-input :value="state.budgetEachDate[idx]"
                                                          :disabled="!isDateInRange(idx)"
                                                          :invalid="isDateInRange(idx) && (!state.budgetEachDate[idx] || !isValidPositiveNumber(Number(state.budgetEachDate[idx])))"
                                                          @update:value="(value) => handleUpdatgeBudgetEachDate(value, idx)"
                                            >
                                                <template #input-right>
                                                    ({{ CURRENCY_SYMBOL[state.selectedCurrency] }})
                                                </template>
                                            </p-text-input>
                                        </p-field-group>
                                    </div>
                                </div>
                            </p-pane-layout>
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
            <p-button :disabled="!state.isContinueAble"
                      @click="emit('click-next')"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE') }}
            </p-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    width: 15rem;
}

.cycle-info-layout {
    margin-left: 1.5rem;
    padding-bottom: 1rem;
    &.fixed-term-layout {
        max-height: 5.375rem;
    }
    .allocation-layout {
        min-width: 500px;
        .monthly-text-layout {
            @apply pt-4 pl-4 bg-gray-100;
            margin-left: 24px;
            width: 25.5rem;
            .increase-layout {
                .p-text-input {
                    width: 11rem;
                }
            }
        }
    }
}

.allocation-enter-manually {
    @apply grid grid-cols-4 grid-rows-3 mt-1;
    .p-text-input {
        width: 82px;
    }
}

.bottom-section {
    @apply flex gap-8;
    .left-section {
        width: 30.5rem;
        .start-selected {
            @apply text-gray-900;
        }
        .end-selected {
            @apply text-gray-300;
        }
    }
    .right-section {
        margin-left: 3rem;
    }
}
</style>

