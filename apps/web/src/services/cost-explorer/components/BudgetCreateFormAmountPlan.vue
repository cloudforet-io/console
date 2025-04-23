<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { PPaneLayout, PHeading } from '@cloudforet/mirinae';


import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';

import BudgetCreateFormAmountPlanLastMonthsCost
    from '@/services/cost-explorer/components/BudgetCreateFormAmountPlanLastMonthsCost.vue';
import BudgetCreateFormAmountPlanMonthly
    from '@/services/cost-explorer/components/BudgetCreateFormAmountPlanMonthly.vue';
import BudgetCreateFormAmountPlanTotal
    from '@/services/cost-explorer/components/BudgetCreateFormAmountPlanTotal.vue';
import BudgetCreateFormAmountPlanUnitSelect
    from '@/services/cost-explorer/components/BudgetCreateFormAmountPlanUnitSelect.vue';
import BudgetCreatePeriodSelect
    from '@/services/cost-explorer/components/BudgetCreatePeriodSelect.vue';
import type { BudgetAmountPlanInfo, MonthAmountInputMap } from '@/services/cost-explorer/types/budget-form-type';
import type { Period } from '@/services/cost-explorer/types/cost-explorer-query-type';



type BudgetTimeUnit = BudgetModel['time_unit'];

interface Props {
    projectId?: string;
    workspaceId?: string;
    providerFilter?: BudgetModel['provider_filter'];
    dataSourceId?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{(e: 'update', amountPlanInfo: BudgetAmountPlanInfo, isAllValid: boolean): void; }>();

const state = reactive({
    period: {} as Period,
    isPeriodValid: false,
    //
    timeUnit: 'TOTAL' as BudgetTimeUnit,
    //
    monthlyInputs: undefined as MonthAmountInputMap|undefined,
    isMonthlyInputsValid: false,
    //
    totalAmount: undefined as number|undefined,
    isTotalAmountValid: false,
    //
    isAllValid: computed<boolean>(() => {
        if (state.timeUnit === 'TOTAL') { return state.isTotalAmountValid && state.isPeriodValid; }
        return state.isMonthlyInputsValid && state.isPeriodValid;
    }),
    amountPlanInfo: computed<BudgetAmountPlanInfo>(() => {
        const result = {
            time_unit: state.timeUnit,
            start: state.period.start,
            end: state.period.end,
        } as BudgetAmountPlanInfo;

        if (state.timeUnit === 'TOTAL') {
            result.limit = state.totalAmount;
        } else if (state.monthlyInputs) {
            result.planned_limits = Object.keys(state.monthlyInputs)
                .map((key) => ({
                    date: key,
                    limit: state.monthlyInputs[key].amount,
                }));
        }

        return result;
    }),
});

const handleUpdatePeriod = (period: Period, isValid: boolean) => {
    state.period = period;
    state.isPeriodValid = isValid;
};

const handleMonthlyInputUpdate = (monthAmountInputMap: MonthAmountInputMap, isValid: boolean) => {
    state.monthlyInputs = monthAmountInputMap;
    state.isMonthlyInputsValid = isValid;
};

const handleTotalAmountUpdate = (amount: number, isValid: boolean) => {
    state.totalAmount = amount;
    state.isTotalAmountValid = isValid;
};

watch([() => state.amountPlanInfo, () => state.isAllValid], ([amountPlanInfo, isAllValid]) => {
    emit('update', amountPlanInfo, isAllValid);
});


</script>

<template>
    <p-pane-layout class="budget-create-form-amount-plan">
        <p-heading class="pt-8 px-4 pb-4"
                   heading-type="sub"
                   :title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BUDGET_DETAILS.TITLE')"
        />
        <div class="p-4">
            <budget-create-period-select
                class="mb-2"
                @update="handleUpdatePeriod"
            />
            <budget-create-form-amount-plan-unit-select
                class="mb-6"
                :selected-unit.sync="state.timeUnit"
            />
            <budget-create-form-amount-plan-monthly
                v-if="state.timeUnit === 'MONTHLY'"
                class="mb-6"
                :data-source-id="props.dataSourceId"
                :period="state.period"
                @update="handleMonthlyInputUpdate"
            >
                <template #last-3-months>
                    <budget-create-form-amount-plan-last-months-cost
                        :project-id="props.projectId"
                        :workspace-id="props.workspaceId"
                        :provider-filter="props.providerFilter"
                        :data-source-id="props.dataSourceId"
                        :time-unit="state.timeUnit"
                    />
                </template>
            </budget-create-form-amount-plan-monthly>
            <budget-create-form-amount-plan-total
                v-else
                class="mb-6"
                :data-source-id="props.dataSourceId"
                @update="handleTotalAmountUpdate"
            >
                <template #last-3-months>
                    <budget-create-form-amount-plan-last-months-cost
                        :project-id="props.projectId"
                        :workspace-id="props.workspaceId"
                        :provider-filter="props.providerFilter"
                        :data-source-id="props.dataSourceId"
                        :time-unit="state.timeUnit"
                    />
                </template>
            </budget-create-form-amount-plan-total>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.p-heading {
    margin-bottom: 0.5rem;
}
</style>
