<script lang="ts" setup>
import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useBudgetGetQuery } from '@/services/cost-explorer/composables/use-budget-get-query';
import { useBudgetUpdateMutation } from '@/services/cost-explorer/composables/use-budget-update-mutation';


interface Props {
    visible: boolean;
    budgetName: string;
    budgetId: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    budgetName: '',
    budgetId: '',
});

const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;}>();

const { invalidateBudgetGetQuery } = useBudgetGetQuery(props.budgetId);

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
            return i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.BUDGET_NAME_INVALID');
        } if (props.budgetName?.includes(val)) {
            return true;
        }
        return true;
    },
});

const { mutate: updateBudget, isPending: isUpdatingBudget } = useBudgetUpdateMutation({
    onSuccess: () => {
        invalidateBudgetGetQuery();
        emit('update:visible', false);
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.NAME_EDIT_SUCCESS'), '');
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
});

const handleCancel = () => {
    emit('update:visible', false);
};

const handleConfirm = () => {
    if (props.budgetId) {
        updateBudget({
            budget_id: props.budgetId,
            name: budgetName.value,
        });
    }
};
</script>

<template>
    <p-button-modal :visible="props.visible"
                    size="sm"
                    :header-title="$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.UPDATE_NAME_TITLE')"
                    :loading="isUpdatingBudget"
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
