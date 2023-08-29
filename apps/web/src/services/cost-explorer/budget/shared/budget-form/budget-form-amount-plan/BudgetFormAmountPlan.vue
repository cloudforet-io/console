<script lang="ts">
import {
    computed,
    reactive, toRefs, watch,
} from 'vue';

import { PPaneLayout, PHeading } from '@spaceone/design-system';

import type { BudgetModel, BudgetTimeUnit, CostTypes } from '@/services/cost-explorer/budget/model';
import BudgetFormAmountPlanLastMonthsCost
    from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlanLastMonthsCost.vue';
import type { MonthAmountInputMap } from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlanMonthly.vue';
import BudgetFormAmountPlanMonthly
    from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlanMonthly.vue';
import BudgetFormAmountPlanTotal
    from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlanTotal.vue';
import BudgetFormAmountPlanUnitSelect
    from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlanUnitSelect.vue';
import BudgetPeriodSelect
    from '@/services/cost-explorer/budget/shared/BudgetPeriodSelect.vue';
import type { Period } from '@/services/cost-explorer/type';

export interface BudgetAmountPlanInfo {
    limit?: BudgetModel['limit'];
    planned_limits?: BudgetModel['planned_limits'];
    time_unit: BudgetModel['time_unit'];
    start: BudgetModel['start'];
    end: BudgetModel['end'];
}

interface Props {
    projectId?: string;
    projectGroupId?: string;
    costTypes?: CostTypes;
}

export default {
    name: 'BudgetFormAmountPlan',
    components: {
        BudgetFormAmountPlanLastMonthsCost,
        BudgetFormAmountPlanTotal,
        BudgetFormAmountPlanMonthly,
        BudgetFormAmountPlanUnitSelect,
        BudgetPeriodSelect,
        PPaneLayout,
        PHeading,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
        projectGroupId: {
            type: String,
            default: undefined,
        },
        costTypes: {
            type: Object,
            default: undefined,
        },
    },
    setup(props: Props, { emit }) {
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

        return {
            ...toRefs(state),
            handleUpdatePeriod,
            handleMonthlyInputUpdate,
            handleTotalAmountUpdate,
        };
    },
};
</script>

<template>
    <p-pane-layout class="budget-form-amount-plan">
        <p-heading heading-type="sub"
                   :title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.AMOUNT_PLANNING')"
        />
        <div class="p-4">
            <budget-period-select class="mb-2"
                                  @update="handleUpdatePeriod"
            />
            <budget-form-amount-plan-unit-select class="mb-6"
                                                 :selected-unit.sync="timeUnit"
            />
            <budget-form-amount-plan-monthly v-if="timeUnit === 'MONTHLY'"
                                             class="mb-6"
                                             :period="period"
                                             @update="handleMonthlyInputUpdate"
            >
                <template #last-3-months>
                    <budget-form-amount-plan-last-months-cost :project-id="projectId"
                                                              :project-group-id="projectGroupId"
                                                              :cost-types="costTypes"
                                                              :time-unit="timeUnit"
                    />
                </template>
            </budget-form-amount-plan-monthly>
            <budget-form-amount-plan-total v-else
                                           class="mb-6"
                                           @update="handleTotalAmountUpdate"
            >
                <template #last-3-months>
                    <budget-form-amount-plan-last-months-cost :project-id="projectId"
                                                              :project-group-id="projectGroupId"
                                                              :cost-types="costTypes"
                                                              :time-unit="timeUnit"
                    />
                </template>
            </budget-form-amount-plan-total>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.p-heading {
    margin-bottom: 0.5rem;
}
</style>
