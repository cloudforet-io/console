<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PTextInput, PButton,
} from '@cloudforet/mirinae';

import type { BudgetCreateParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/create';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { COST_EXPLORER_ROUTE } from '../routes/route-constant';
import { useBudgetCreatePageStore } from '../stores/budget-create-page-store';


const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;
const appContextStore = useAppContextStore();

const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);

const router = useRouter();

const state = reactive({
    thresholds: [],
});

const addThreshold = () => {
    budgetCreatePageStore.setThresholds({ value: 0 });
};

const handleUpdateThreshold = (value: number, index: number) => {
    budgetCreatePageState.thresholds[index].value = value;
};

const handleBudgetManager = () => {
    budgetCreatePageState.currentStep = 1;
};

const createBudget = async (type: 'skip' | 'set') => {
    if (budgetCreatePageState.loading) return;

    budgetCreatePageState.loading = true;
    try {
        const params: BudgetCreateParameters = {
            name: budgetCreatePageState.name,
            limit: budgetCreatePageState.limit,
            planned_limits: budgetCreatePageState.planned_limits,
            currency: budgetCreatePageState.currency ?? 'USD',
            time_unit: budgetCreatePageState.time_unit === 'fixedTerm' ? 'TOTAL' : 'MONTHLY',
            start: dayjs.utc(budgetCreatePageState.startMonth[0]).format('YYYY-MM'),
            end: dayjs.utc(budgetCreatePageState.endMonth[0]).format('YYYY-MM'),
            notifications: type === 'set' ? {
                state: state.thresholds.filter((threshold) => threshold.value.length > 0).length > 0
                    ? 'ENABLED' : 'DISABLED',
                plans: Number(state.thresholds) > 0 ? state.thresholds.map((threshold) => ({
                    unit: 'PERCENT',
                    threshold: threshold.value === 0 ? 0 : Number(threshold.value),
                })) : [],
                recipients: {
                    role_types: budgetCreatePageState.recipients.role_types,
                    users: budgetCreatePageState.recipients.users,
                    // service_account_manager: '',
                },
            } : {
                state: 'DISABLED',
            },
            tags: {},
            resource_group: isAdminMode.value ? 'WORKSPACE' : 'PROJECT',
            project_id: budgetCreatePageState.project,
            service_account_id: budgetCreatePageState.scope.serviceAccount,
        };
        await SpaceConnector.clientV2.costAnalysis.budget.create<BudgetCreateParameters, BudgetModel>(params);

        budgetCreatePageState.loading = false;
        router.push({
            name: COST_EXPLORER_ROUTE.BUDGET._NAME,
        });
    } catch (error) {
        ErrorHandler.handleError(error, true);
    } finally {
        budgetCreatePageStore.reset();
    }
};
</script>

<template>
    <div>
        <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.EXCEEDS_AMOUNT')"
                       :help-text="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.EXCEEDS_AMOUNT_DESCRIPTION')"
                       required
                       invalid-text="Exceeds amount is required"
                       :invalid="budgetCreatePageState.thresholds.some((threshold) => threshold.value <= 0)"
        >
            <template #label-extra>
                <p-button class="ml-3 font-light"
                          size="sm"
                          style-type="tertiary"
                          @click="handleBudgetManager"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.EDIT_BUDGET_MANAGER') }}
                </p-button>
            </template>
            <div v-for="(threshold, idx) in budgetCreatePageState.thresholds"
                 :key="idx"
            >
                <p-text-input class="mt-4"
                              :value="threshold.value"
                              :invalid="threshold.value <= 0"
                              @update:value="(value) => handleUpdateThreshold(value, idx)"
                >
                    <template #input-right>
                        %
                    </template>
                </p-text-input>
                <span class="ml-2">of budget</span>
            </div>
        </p-field-group>
        <p-button class="secondary"
                  icon-left="ic_plus"
                  @click="addThreshold"
        >
            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.ADD_THRESHOLD') }}
        </p-button>
        <div class="mt-8 flex justify-end gap-4">
            <p-button style-type="tertiary"
                      :loading="budgetCreatePageState.loading"
                      @click="createBudget('skip')"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SKIP_FOR_LATER') }}
            </p-button>
            <p-button class="substitutive"
                      :loading="budgetCreatePageState.loading"
                      :disabled="budgetCreatePageState.thresholds.filter((threshold) => threshold.value > 0).length !== budgetCreatePageState.thresholds.length"
                      @click="createBudget('set')"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SET') }}
            </p-button>
        </div>
    </div>
</template>
