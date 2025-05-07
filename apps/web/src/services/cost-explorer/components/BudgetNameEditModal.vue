<script lang="ts" setup>


import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import type { BudgetUpdateParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/update';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';

interface Props {
    visible: boolean;
    budgetName: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    budgetName: '',
});

const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
}>();

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;

const state = reactive({
    loading: false,
    budgetName: computed<string|undefined>(() => budgetPageState?.budgetData?.name),
});

const {
    forms: { budgetName },
    invalidState,
    invalidTexts,
    setForm,
} = useFormValidator({
    budgetName: props.budgetName,
}, {
    budgetName: (val: string) => {
        if (val.length < 1) {
            return 'nononono';
            // return i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.BUDGET_NAME_INVALID');
        } if (state.budgetName?.includes(val)) {
            return true;
        }
        return true;
    },
});

const updateBudgetName = async (params: BudgetUpdateParameters) => {
    try {
        state.loading = true;
        await SpaceConnector.clientV2.costAnalysis.budget.update<BudgetUpdateParameters, BudgetModel>(params);
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.NAME_EDIT_SUCCESS'), '');
        emit('update:visible', false);
    } catch (error) {
        ErrorHandler.handleError(error, true);
    } finally {
        state.loading = false;
    }
};

const handleCancel = () => {
    emit('update:visible', false);
};

const handleConfirm = async () => {
    if (budgetPageState.budgetData?.budget_id) {
        await updateBudgetName({
            budget_id: budgetPageState.budgetData?.budget_id,
            name: budgetName.value,
        });
    }
};
</script>

<template>
    <p-button-modal :visible="props.visible"
                    size="sm"
                    :header-title="$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.UPDATE_NAME_TITLE')"
                    :loading="state.loading"
                    :disabled="invalidState.budgetName"
                    @cancel="handleCancel"
                    @close="handleCancel"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.BUDGET_NAME')"
                           :invalid="invalidState.budgetName"
                           :invalid-text="invalidTexts.budgetName"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="props.budgetName"
                                  block
                                  :invalid="invalid"
                                  @update:value="setForm('budgetName', $event)"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>
