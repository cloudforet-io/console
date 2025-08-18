<script setup lang="ts">
import {
    computed, reactive, watch, ref,
} from 'vue';

import dayjs from 'dayjs';

import {
    PFieldGroup, PSelectDropdown, PDatetimePicker, PButton,
    PDivider, PRadioGroup, PRadio, PPaneLayout, PTextInput, PBadge, PSelectCard,
} from '@cloudforet/mirinae';

import { useBudgetUsageApi } from '@/api-clients/cost-analysis/budget/composables/use-budget-usage-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/display/constant';
import { useDomainStore } from '@/store/domain/domain-store';

import type { UnifiedCostConfig } from '@/services/advanced/types/preferences-type';
import BudgetLastThreeMonthCostTrendBarChart from '@/services/cost-explorer/components/BudgetLastThreeMonthCostTrendBarChart.vue';
import { DEFAULT_UNIFIED_COST_CURRENCY, YAHOO_FINANCE_ID } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useBudgetCreatePageStore } from '@/services/cost-explorer/stores/budget-create-page-store';


const { budgetUsageAPI } = useBudgetUsageApi();
const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;

const isStartMonthManuallyChanged = ref(false);

const handleStartMonthPickerClosed = () => {
    isStartMonthManuallyChanged.value = true;
};
const domainStore = useDomainStore();
const domainState = domainStore.state;

const originUnifiedCostConfig = computed<UnifiedCostConfig|undefined>(() => domainState.config?.settings?.unified_cost_config);

const referenceMap = useAllReferenceDataModel();
const state = reactive({
    selectedCurrency: originUnifiedCostConfig.value?.currency ?? DEFAULT_UNIFIED_COST_CURRENCY,
    exchangeRateSourceOptions: [YAHOO_FINANCE_ID],
    selectedExchangeRateSource: originUnifiedCostConfig.value?.exchange_source ?? YAHOO_FINANCE_ID,
    budgetCycleList: [
        { name: 'TOTAL', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.FIXED_TERM') },
        { name: 'MONTHLY', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.MONTHLY') },
    ],
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

const { key: budgetUsageListQueryKey, params: budgetUsageListQueryParams } = useServiceQueryKey('cost-analysis', 'budget-usage', 'list', {
    params: computed(() => ({
        query: {
            filter: [
                budgetCreatePageState.scope.serviceAccount
                    ? {
                        k: 'service_account_id',
                        v: budgetCreatePageState.scope.serviceAccount,
                        o: 'eq',
                    }
                    : {
                        k: 'service_account_id',
                        v: [null, ''],
                        o: 'in',
                    },
                {
                    k: 'project_id',
                    v: budgetCreatePageState.project,
                    o: 'eq',
                },
                {
                    k: 'date',
                    v: dayjs.utc(budgetCreatePageState.startMonth[0]).format('YYYY-MM'),
                    o: 'gte',
                },
                {
                    k: 'date',
                    v: dayjs.utc(budgetCreatePageState.endMonth[0]).format('YYYY-MM'),
                    o: 'lte',
                },
            ],
        },
    })),
});

const { data: budgetUsageList } = useScopedQuery({
    queryKey: budgetUsageListQueryKey,
    queryFn: () => budgetUsageAPI.list(budgetUsageListQueryParams.value),
    select: (data) => data.results ?? [],
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 3,
    enabled: true,
}, ['WORKSPACE']);


const isCycleEnabled = computed(() => budgetCreatePageState.startMonth.length > 0
    && budgetCreatePageState.endMonth.length > 0
    && budgetUsageList.value?.length === 0);

const emit = defineEmits<{(e: 'click-next'): void}>();

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

const handleGoBack = () => {
    budgetCreatePageStore.setCurrentStep(1);
};

const handleUpdateBudgetAmount = (value) => {
    if (value === '' || value === null || Number.isNaN(Number(value))) {
        budgetCreatePageStore.setLimit(undefined);
    } else {
        budgetCreatePageStore.setLimit(Number(value));
    }
};

const handleUpdateBudgetAppliedSameAmount = (value) => {
    if (value === '' || value === null || Number.isNaN(Number(value))) {
        budgetCreatePageStore.setBudgetAppliedSameAmount(undefined);
    } else {
        budgetCreatePageStore.setBudgetAppliedSameAmount(Number(value));
    }
};

const handleUpdateInitialAmount = (value) => {
    if (value === '' || value === null || Number.isNaN(Number(value))) {
        budgetCreatePageStore.setInitialAmount(undefined);
    } else {
        budgetCreatePageStore.setInitialAmount(Number(value));
    }
};

const handleUpdateMonthlyGrowthRate = (value) => {
    if (value === '' || value === null || Number.isNaN(Number(value))) {
        budgetCreatePageStore.setMonthlyGrowthRate(undefined);
    } else {
        budgetCreatePageStore.setMonthlyGrowthRate(Number(value));
    }
};

const handleSelectBudgetCycle = (value: string) => {
    budgetCreatePageStore.setTimeUnit(value);
};

const isValidPositiveNumber = (value: any): boolean => {
    const num = Number(value);
    return value !== '' && !Number.isNaN(num) && num > 0;
};

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
}, { deep: true, immediate: true });

watch(() => budgetCreatePageState.selectedMonthlyBudgetAllocation, (nv, ov) => {
    if (nv !== ov) {
        if (nv === 'applySameAmount') {
            budgetCreatePageStore.setInitialAmount(undefined);
            budgetCreatePageStore.setMonthlyGrowthRate(undefined);
            budgetCreatePageState.budgetEachDate = Array(12).fill('');
        } else if (nv === 'increaseBySpecificPercentage') {
            budgetCreatePageStore.setBudgetAppliedSameAmount(undefined);
            budgetCreatePageState.budgetEachDate = Array(12).fill('');
        } else if (nv === 'enterManually') {
            budgetCreatePageStore.setBudgetAppliedSameAmount(undefined);
            budgetCreatePageStore.setInitialAmount(undefined);
            budgetCreatePageStore.setMonthlyGrowthRate(undefined);
        }

        budgetCreatePageStore.setPlannedLimits([]);
    }
}, { deep: true, immediate: true });

watch(() => [
    budgetCreatePageState.selectedMonthlyBudgetAllocation,
    budgetCreatePageState.budgetAppliedSameAmount,
    budgetCreatePageState.initialAmount,
    budgetCreatePageState.monthlyGrowthRate,
    budgetCreatePageState.budgetEachDate,
    budgetCreatePageState.startMonth,
    budgetCreatePageState.endMonth,
], () => {
    const planned_limits: any[] = [];

    if (budgetCreatePageState.startMonth.length === 0 || budgetCreatePageState.endMonth.length === 0) {
        budgetCreatePageStore.setPlannedLimits([]);
        return;
    }

    const startDate = dayjs.utc(budgetCreatePageState.startMonth[0]);
    const endDate = dayjs.utc(budgetCreatePageState.endMonth[0]);
    let currentDate = startDate;

    const dateDiff = endDate.diff(startDate, 'month') + 1;

    if (budgetCreatePageState.selectedMonthlyBudgetAllocation === 'applySameAmount') {
        if (isValidPositiveNumber(budgetCreatePageState.budgetAppliedSameAmount)) {
            while (currentDate.isSameOrBefore(endDate, 'month')) {
                planned_limits.push({
                    date: currentDate.format('YYYY-MM'),
                    limit: Number(budgetCreatePageState.budgetAppliedSameAmount),
                });
                currentDate = currentDate.add(1, 'month');
            }
        }
    } else if (budgetCreatePageState.selectedMonthlyBudgetAllocation === 'increaseBySpecificPercentage') {
        if (isValidPositiveNumber(budgetCreatePageState.initialAmount) && isValidPositiveNumber(budgetCreatePageState.monthlyGrowthRate)) {
            let currentAmount = budgetCreatePageState.initialAmount;
            while (currentDate.isSameOrBefore(endDate, 'month')) {
                planned_limits.push({
                    date: currentDate.format('YYYY-MM'),
                    limit: Math.round(currentAmount),
                });
                currentAmount *= (1 + (budgetCreatePageState.monthlyGrowthRate / 100));
                currentDate = currentDate.add(1, 'month');
            }
        }
    } else if (budgetCreatePageState.selectedMonthlyBudgetAllocation === 'enterManually') {
        if (budgetCreatePageState.budgetEachDate.length === dateDiff) {
            for (let i = 0; i < dateDiff; i++) {
                const value = budgetCreatePageState.budgetEachDate[i];
                if (!isValidPositiveNumber(value)) {
                    budgetCreatePageStore.setPlannedLimits([]);
                    return;
                }
                planned_limits.push({
                    date: currentDate.format('YYYY-MM'),
                    limit: Number(value),
                });
                currentDate = currentDate.add(1, 'month');
            }
        }
    }

    budgetCreatePageStore.setPlannedLimits(planned_limits);
}, { deep: true });

watch(() => [
    budgetCreatePageState.time_unit,
    budgetCreatePageState.limit,
    budgetCreatePageState.planned_limits,
    budgetCreatePageState.selectedMonthlyBudgetAllocation,
    budgetCreatePageState.budgetAppliedSameAmount,
    budgetCreatePageState.initialAmount,
    budgetCreatePageState.monthlyGrowthRate,
    budgetCreatePageState.budgetEachDate,
    state.startSelectedForBudgetYear,
    state.endSelectedForBudgetYear,
    budgetCreatePageState.startMonth,
    budgetCreatePageState.endMonth,
], () => {
    if (!budgetCreatePageState.time_unit) {
        state.isContinueAble = false;
        return;
    }
    if (budgetUsageList.value.length > 0) {
        state.isContinueAble = false;
        return;
    }

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
    } else if (budgetCreatePageState.time_unit === 'TOTAL' && budgetCreatePageState.limit === undefined) {
        state.isContinueAble = false;
    } else if (budgetCreatePageState.time_unit === 'MONTHLY') {
        if (budgetCreatePageState.selectedMonthlyBudgetAllocation === 'applySameAmount') {
            if (isValidPositiveNumber(budgetCreatePageState.budgetAppliedSameAmount)) {
                state.isContinueAble = true;
                return;
            }
        } else if (budgetCreatePageState.selectedMonthlyBudgetAllocation === 'increaseBySpecificPercentage') {
            const isInitialValid = isValidPositiveNumber(budgetCreatePageState.initialAmount);
            const isGrowthValid = isValidPositiveNumber(budgetCreatePageState.monthlyGrowthRate);
            state.isContinueAble = isInitialValid && isGrowthValid;
            return;
        } else if (budgetCreatePageState.selectedMonthlyBudgetAllocation === 'enterManually') {
            const allValuesFilled = budgetCreatePageState.budgetEachDate.length === 12 && budgetCreatePageState.budgetEachDate
                .every((v, idx) => {
                    if (isDateInRange(idx)) {
                        return isValidPositiveNumber(v);
                    }
                    return true;
                });

            if (allValuesFilled) {
                state.isContinueAble = true;
                return;
            }
            state.isContinueAble = false;
            return;
        }
        state.isContinueAble = false;
    }
}, { deep: true, immediate: true });

watch(() => budgetCreatePageState.selectedMonthlyBudgetAllocation, (nv, ov) => {
    if (nv !== ov) {
        budgetCreatePageStore.setPlannedLimits([]);
    }
}, { deep: true, immediate: true });

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
}, { deep: true, immediate: true });

watch(() => budgetCreatePageState.limit, () => {
    if (budgetCreatePageState.limit === null) {
        budgetCreatePageState.limit = undefined;
    }
}, { deep: true, immediate: true });

watch(() => budgetCreatePageState.startMonth[0], (newVal, oldVal) => {
    if (newVal !== oldVal && budgetCreatePageState.currentStep === 2) {
        if (isStartMonthManuallyChanged.value) {
            budgetCreatePageStore.setEnd([]);
            budgetCreatePageState.selectedMonthlyBudgetAllocation = '';
            budgetCreatePageState.budgetAppliedSameAmount = undefined;
            budgetCreatePageState.initialAmount = undefined;
            budgetCreatePageState.monthlyGrowthRate = undefined;
            budgetCreatePageState.budgetEachDate = Array(12).fill('');
            isStartMonthManuallyChanged.value = false;
        }
        if (budgetCreatePageState.startMonth.length === 0
            || budgetCreatePageState.endMonth.length === 0
            || budgetUsageList.value && budgetUsageList.value.length > 0) {
            budgetCreatePageState.time_unit = '';
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
        <div class="left-section">
            <p-divider />
            <p class="text-base font-bold mt-6">
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_PERIOD') }}
            </p>
            <div class="flex gap-6 mt-2 -mb-4">
                <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.START_MONTH')"
                               :invalid="budgetUsageList && budgetUsageList.length > 0"
                               required
                               class="flex flex-col "
                >
                    <template #label-extra>
                        <span class="text-gray-400 text-xs font-normal">
                            ({{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.MONTH') }})
                        </span>
                    </template>
                    <p-datetime-picker data-type="yearToMonth"
                                       :selected-dates.sync="budgetCreatePageState.startMonth"
                                       :placeholder="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SELECT_MONTH')"
                                       :invalid="budgetUsageList && budgetUsageList.length > 0"
                                       @close="handleStartMonthPickerClosed"
                    />
                </p-field-group>
                <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.END_MONTH')"
                               :invalid="budgetUsageList && budgetUsageList.length > 0"
                               required
                >
                    <template #label-extra>
                        <span class="text-gray-400 text-xs font-normal">
                            ({{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.MONTH') }})
                        </span>
                    </template>
                    <p-datetime-picker data-type="yearToMonth"
                                       :selected-dates.sync="budgetCreatePageState.endMonth"
                                       :placeholder="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SELECT_MONTH')"
                                       :min-date="budgetCreatePageState.startMonth.length > 0
                                           ? dayjs.utc(budgetCreatePageState.startMonth[0]).add(1, 'month').format('YYYY-MM') : ''"
                                       :max-date="budgetCreatePageState.startMonth.length > 0 ? dayjs.utc(budgetCreatePageState.startMonth[0]).add(11, 'month').format('YYYY-MM') : ''"
                                       :invalid="budgetUsageList && budgetUsageList.length > 0 || (budgetCreatePageState.startMonth.length > 0
                                           && budgetCreatePageState.endMonth.length === 0)"
                    />
                </p-field-group>
            </div>
            <span v-if="budgetUsageList && budgetUsageList.length > 0"
                  class="text-red-500 font-normal text-xs"
            >
                {{ budgetCreatePageState.scope.type === 'project'
                    ? $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PROJECT_DUPLICATED_WARNING1', {
                        project: referenceMap.project[budgetCreatePageState.project]?.name || budgetCreatePageState.project,
                        month_list: budgetUsageList.sort((a, b) => (a.date > b.date ? 1 : -1)).map(d => d.date)
                    }) : $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PROJECT_DUPLICATED_WARNING2', {
                        project: referenceMap.project[budgetCreatePageState.project]?.name || budgetCreatePageState.project,
                        serviceAccount: referenceMap.serviceAccount[budgetCreatePageState.scope.serviceAccount]?.name || budgetCreatePageState.scope.serviceAccount,
                        month_list: budgetUsageList.sort((a, b) => (a.date > b.date ? 1 : -1)).map(d => d.date)
                    }) }}
            </span>
            <div class="mt-2">
                <budget-last-three-month-cost-trend-bar-chart />
            </div>
            <p class="text-base font-bold mt-6">
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_CYCLE') }}
            </p>
            <div class="flex mt-1">
                <p-field-group
                    :help-text="!isCycleEnabled ? $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_CYCLE_DESCRIPTION') : ''"
                    required
                >
                    <div class="flex gap-2 w-[52.5rem] pt-2">
                        <p-select-card v-for="(cycle, idx) in state.budgetCycleList"
                                       :key="`budget-cycle-${idx}`"
                                       v-model="budgetCreatePageState.time_unit"
                                       :selected.sync="budgetCreatePageState.time_unit"
                                       :tab-index="idx"
                                       :value="cycle.name"
                                       :label="cycle.label"
                                       :disabled="!isCycleEnabled"
                                       block
                                       @change="handleSelectBudgetCycle"
                        />
                    </div>
                </p-field-group>
            </div>
            <p v-if="budgetCreatePageState.time_unit.length > 0 && isCycleEnabled"
               class="font-bold text-sm mb-2"
            >
                {{ budgetCreatePageState.time_unit === 'TOTAL' ? $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.FIXED_TERM')
                    : $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.MONTHLY_BUDGET_ALLOCATION') }}
            </p>
            <p-pane-layout v-if="budgetCreatePageState.time_unit.length > 0 && isCycleEnabled && budgetCreatePageState.time_unit === 'TOTAL'"
                           class="cycle-info-layout pt-4 pl-4"
            >
                <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_AMOUNT')"
                               :invalid="!isValidPositiveNumber(budgetCreatePageState.limit)"
                               :invalid-text="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.AMOUNT_INVALID_TEXT')"
                               style-type="secondary"
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
            </p-pane-layout>
            <div v-else-if="budgetCreatePageState.time_unit.length > 0 && isCycleEnabled && budgetCreatePageState.time_unit === 'MONTHLY'">
                <div class="allocation-layout">
                    <p-radio-group direction="vertical"
                                   class="flex flex-col"
                    >
                        <p-radio
                            v-model="budgetCreatePageState.selectedMonthlyBudgetAllocation"
                            value="applySameAmount"
                            :disabled="budgetCreatePageState.startMonth.length === 0 || budgetCreatePageState.endMonth.length === 0"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.APPLY_THE_SAME_AMOUNT') }}
                        </p-radio>
                        <p-pane-layout v-if="budgetCreatePageState.selectedMonthlyBudgetAllocation === 'applySameAmount'"
                                       class="monthly-text-layout"
                        >
                            <p-field-group v-if="budgetCreatePageState.selectedMonthlyBudgetAllocation === 'applySameAmount'"
                                           :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.AMOUNT_EACH_MONTH')"
                                           :invalid="!isValidPositiveNumber(budgetCreatePageState.budgetAppliedSameAmount)"
                                           :invalid-text="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.AMOUNT_INVALID_TEXT')"
                                           style-type="secondary"
                                           required
                            >
                                <template #label-extra>
                                    <span class="text-gray-400 text-xs font-normal">
                                        ({{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.EACH_MONTH') }})
                                    </span>
                                </template>
                                <p-text-input :value="budgetCreatePageState.budgetAppliedSameAmount"
                                              :invalid="!isValidPositiveNumber(budgetCreatePageState.budgetAppliedSameAmount)"
                                              @update:value="handleUpdateBudgetAppliedSameAmount"
                                >
                                    <template #input-right>
                                        ({{ CURRENCY_SYMBOL[state.selectedCurrency] }})
                                    </template>
                                </p-text-input>
                            </p-field-group>
                        </p-pane-layout>
                        <p-radio
                            v-model="budgetCreatePageState.selectedMonthlyBudgetAllocation"
                            value="increaseBySpecificPercentage"
                            :disabled="budgetCreatePageState.startMonth.length === 0 || budgetCreatePageState.endMonth.length === 0"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.INCRASE_BY_SPECIFIC_PERCENTAGE') }}
                        </p-radio>
                        <p-pane-layout v-if="budgetCreatePageState.selectedMonthlyBudgetAllocation === 'increaseBySpecificPercentage'"
                                       class="monthly-text-layout"
                        >
                            <div v-if="budgetCreatePageState.selectedMonthlyBudgetAllocation === 'increaseBySpecificPercentage'"
                                 class="increase-layout"
                            >
                                <div class="flex gap-6 mt-1">
                                    <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.INITIAL_AMOUNT')"
                                                   style-type="secondary"
                                                   :invalid="!isValidPositiveNumber(budgetCreatePageState.initialAmount)"
                                                   :invalid-text="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.AMOUNT_INVALID_TEXT')"
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
                                                   :invalid="!isValidPositiveNumber(budgetCreatePageState.monthlyGrowthRate)"
                                                   :invalid-text="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.AMOUNT_INVALID_TEXT')"
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
                        </p-pane-layout>
                        <p-radio
                            v-model="budgetCreatePageState.selectedMonthlyBudgetAllocation"
                            value="enterManually"
                            :disabled="budgetCreatePageState.startMonth.length === 0 || budgetCreatePageState.endMonth.length === 0"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.ENTER_MANUALLY') }}
                        </p-radio>
                        <p-pane-layout v-if="budgetCreatePageState.selectedMonthlyBudgetAllocation === 'enterManually'"
                                       class="monthly-text-layout"
                        >
                            <div v-if="budgetCreatePageState.selectedMonthlyBudgetAllocation === 'enterManually'">
                                <div class="allocation-enter-manually">
                                    <p-field-group v-for="(date, idx) in state.dateList"
                                                   :key="`budget-date-${idx}`"
                                                   :label="date"
                                                   :invalid="isDateInRange(idx) && (!budgetCreatePageState.budgetEachDate[idx]
                                                       || !isValidPositiveNumber(Number(budgetCreatePageState.budgetEachDate[idx])))"
                                                   :invalid-text="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.AMOUNT_INVALID_TEXT')"
                                                   style-type="secondary"
                                                   required
                                    >
                                        <p-text-input :value="budgetCreatePageState.budgetEachDate[idx]"
                                                      :disabled="!isDateInRange(idx)"
                                                      :invalid="isDateInRange(idx) && (!budgetCreatePageState.budgetEachDate[idx]
                                                          || !isValidPositiveNumber(Number(budgetCreatePageState.budgetEachDate[idx])))"
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
                    </p-radio-group>
                </div>
            </div>
        </div>
        <div class="mt-8 flex justify-end gap-4">
            <p-button icon-left="ic_arrow-left"
                      style-type="transparent"
                      @click="handleGoBack"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.GO_BACK') }}
            </p-button>
            <p-button icon-right="ic_arrow-right"
                      :disabled="!state.isContinueAble"
                      style-type="substitutive"
                      @click="emit('click-next')"
            >
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

.cycle-info-layout {
    background-color: transparent !important;
}

.allocation-layout {
    .monthly-text-layout {
        @apply pt-4 pl-4 ml-6 bg-gray-100;
    }
}

.allocation-enter-manually {
    @apply grid grid-cols-4 gap-2;
    .p-text-input {
        width: 174px;
    }
}

.bottom-section {
    @apply flex gap-8;
    .left-section {
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
