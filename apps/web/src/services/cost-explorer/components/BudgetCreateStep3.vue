<script setup lang="ts">
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PTextInput, PButton,
} from '@cloudforet/mirinae';

import type { BudgetCreateParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/create';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useBudgetCreatePageStore } from '../stores/budget-create-page-store';


const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;
const appContextStore = useAppContextStore();

const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);

const state = reactive({
    thresholds: [{ value: '' }],
});

const addThreshold = () => {
    state.thresholds.push({ value: '' });
};

const handleUpdateThreshold = (value: string, index: number) => {
    state.thresholds[index].value = value;
};

const handleBudgetManager = () => {
    budgetCreatePageState.currentStep = 1;
};

const createBudget = async () => {
    if (budgetCreatePageState.loading) return;

    budgetCreatePageState.loading = true;
    try {
        const params: BudgetCreateParameters = {
            name: budgetCreatePageState.name,
            limit: budgetCreatePageState.limit,
            planned_limits: budgetCreatePageState.planned_limits,
            // currency: budgetCreatePageState.currency, ??
            time_unit: budgetCreatePageState.time_unit === 'fixedTerm' ? 'TOTAL' : 'MONTHLY',
            start: dayjs.utc(budgetCreatePageState.startMonth).format('YYYY-MM'),
            end: dayjs.utc(budgetCreatePageState.endMonth).format('YYYY-MM'),
            notifications: {
                state: state.thresholds.filter((threshold) => threshold.value.length > 0).length > 0
                    ? 'ENABLED' : 'DISABLED',
                plans: state.thresholds.map((threshold) => ({
                    unit: 'PERCENT',
                    threshold: threshold.value,
                })),
                recipients: {
                    role_types: budgetCreatePageState.recipients.role_types,
                    users: budgetCreatePageState.recipients.users,
                    // service_account_manager: .service_account_manager
                },
            },
            tags: {},
            resource_group: isAdminMode.value ? 'WORKSPACE' : 'PROJECT',
            project_id: budgetCreatePageState.project,
            service_account_id: '',
        };
        await SpaceConnector.clientV2.costAnalysis.budget.create<BudgetCreateParameters, BudgetModel>(params);
    } catch (error) {
        ErrorHandler.handleError(error, true);
    }
};
</script>

<template>
    <div>
        <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.EXCEEDS_AMOUNT')"
                       :help-text="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.EXCEEDS_AMOUNT_DESCRIPTION')"
                       required
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
            <div v-for="(threshold, idx) in state.thresholds"
                 :key="idx"
            >
                <p-text-input class="mt-4"
                              :value="threshold.value"
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
                      @click="createBudget"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SKIP_FOR_LATER') }}
            </p-button>
            <p-button class="substitutive"
                      @click="createBudget"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SET') }}
            </p-button>
        </div>
    </div>
</template>
