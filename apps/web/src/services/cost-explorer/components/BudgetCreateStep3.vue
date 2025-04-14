<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router/composables';


import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PTextInput, PButton, PIconButton,
} from '@cloudforet/mirinae';

import type { BudgetCreateParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/create';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { COST_EXPLORER_ROUTE } from '../routes/route-constant';
import { useBudgetCreatePageStore } from '../stores/budget-create-page-store';


const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;

const router = useRouter();

const invalidThreshold = ref<boolean>(false);

const isAlertRecipientsSelected = ref<boolean>(false);

watch(() => budgetCreatePageState.thresholds, () => {
    const filteredThresholdInvalidState = budgetCreatePageState.thresholds.filter((threshold) => {
        if (threshold.value) {
            if (Number(threshold.value) === 10 || Number(threshold.value) === 20 || Number(threshold.value) === 30
            || Number(threshold.value) === 40 || Number(threshold.value) === 50 || Number(threshold.value) === 60
            || Number(threshold.value) === 70 || Number(threshold.value) === 80 || Number(threshold.value) === 90) {
                return false;
            } if (Number(threshold.value) <= 0 || typeof threshold.value !== 'number') {
                return true;
            }
            return true;
        }
        return true;
    });

    if (filteredThresholdInvalidState.length === 0) {
        invalidThreshold.value = true;
    } else {
        invalidThreshold.value = false;
    }
}, { deep: true, immediate: true });

watch(() => budgetCreatePageState.recipients.users, () => {
    if (budgetCreatePageState.recipients.users.length > 0) {
        isAlertRecipientsSelected.value = true;
    } else {
        isAlertRecipientsSelected.value = false;
    }
}, { immediate: true });

const addThreshold = () => {
    budgetCreatePageStore.setThresholds({ value: 0 });
};

const handleUpdateThreshold = (value: number, index: number) => {
    budgetCreatePageState.thresholds[index].value = value;
};

const handleBudgetManager = () => {
    budgetCreatePageState.currentStep = 1;
};

const handleRemoveThreshold = () => {
    const index = budgetCreatePageState.thresholds.length - 1;
    if (index >= 0) {
        budgetCreatePageState.thresholds.splice(index, 1);
    }
};

const handleSelectIds = (selectedIds: string[]) => {
    if (selectedIds.length > 0) budgetCreatePageStore.setRecipients(selectedIds);
};

const handleFormatRecipients = (value: Record<string, any>) => {
    if (Array.isArray(value.USER) && value.USER.length === 0) {
        budgetCreatePageStore.setRecipients([]);
    }
};

const createBudget = async (type: 'skip' | 'set') => {
    if (budgetCreatePageState.loading) return;

    try {
        budgetCreatePageState.loading = true;
        const params: BudgetCreateParameters = {
            name: budgetCreatePageState.name,
            limit: budgetCreatePageState.limit,
            planned_limits: budgetCreatePageState.planned_limits,
            currency: budgetCreatePageState.currency ?? 'USD',
            time_unit: budgetCreatePageState.time_unit === 'TOTAL' ? 'TOTAL' : 'MONTHLY',
            start: dayjs.utc(budgetCreatePageState.startMonth[0]).format('YYYY-MM'),
            end: dayjs.utc(budgetCreatePageState.endMonth[0]).format('YYYY-MM'),
            notification: type === 'set' ? {
                state: budgetCreatePageState.thresholds.filter((threshold) => threshold.value && threshold.value > 0).length > 0
                    ? 'ENABLED' : 'DISABLED',
                plans: budgetCreatePageState.thresholds.length > 0 ? budgetCreatePageState.thresholds.map((threshold) => ({
                    unit: 'PERCENT',
                    threshold: threshold.value === 0 ? 0 : Number(threshold.value),
                })) : [],
                recipients: {
                    users: budgetCreatePageState.recipients.users,
                },
            } : {
                state: 'DISABLED',
            },
            tags: {},
            resource_group: 'PROJECT',
            project_id: budgetCreatePageState.project,
            service_account_id: budgetCreatePageState.scope.serviceAccount,
            budget_manager_id: budgetCreatePageState.budgetManager,
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
        <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SET_ALERT_PERCENTAGE')"
                       :help-text="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.EXCEEDS_AMOUNT_DESCRIPTION')"
                       required
                       :invalid-text="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.THRESHOLD_INVALID_TEXT')"
                       :invalid="!invalidThreshold"
        >
            <div class="flex flex-col gap-2">
                <div v-for="(threshold, idx) in budgetCreatePageState.thresholds"
                     :key="idx"
                     class="flex items-center gap-2"
                >
                    <p-text-input
                        :value="threshold.value"
                        :invalid="!invalidThreshold"
                        @update:value="(value) => handleUpdateThreshold(value, idx)"
                    >
                        <template #input-right>
                            %
                        </template>
                    </p-text-input>
                    <span>of budget</span>
                    <p-icon-button v-if="idx > 0"
                                   name="ic_delete"
                                   style-type="tertiary"
                                   shape="square"
                                   width="1.5rem"
                                   height="1.5rem"
                                   @click="handleRemoveThreshold"
                    />
                </div>
            </div>
        </p-field-group>
        <p-button class="secondary"
                  icon-left="ic_plus"
                  @click="addThreshold"
        >
            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.ADD_THRESHOLD') }}
        </p-button>
        <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.ALERT_RECIPIENTS')"
                       :help-text="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.ADD_RECIPIENTS_TEXT')"
                       class="mt-8"
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
            <user-select-dropdown show-user-list
                                  selection-type="multiple"
                                  :selected-ids="budgetCreatePageState.recipients.users"
                                  @update:selected-ids="handleSelectIds"
                                  @formatted-selected-ids="handleFormatRecipients"
            />
        </p-field-group>
        <div class="mt-8 flex justify-end gap-4">
            <p-button style-type="tertiary"
                      :loading="budgetCreatePageState.loading"
                      @click="createBudget('skip')"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SKIP_FOR_LATER') }}
            </p-button>
            <p-button class="substitutive"
                      :disabled="!invalidThreshold || !isAlertRecipientsSelected"
                      :loading="budgetCreatePageState.loading"
                      @click="createBudget('set')"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SET') }}
            </p-button>
        </div>
    </div>
</template>
