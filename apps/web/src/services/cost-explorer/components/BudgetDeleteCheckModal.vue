<script setup lang="ts">
import { PButtonModal } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useBudgetDeleteMutation } from '@/services/cost-explorer/composables/use-budget-delete-mutation';

interface Props {
    visible: boolean;
    selectedIndices: string[]|undefined;
}

const props = withDefaults(defineProps<Props>(), {
    visible: true,
    selectedIndices: undefined,
});

const emit = defineEmits<{(e: 'update:visible', visible: boolean): void, (e: 'confirm'): void
}>();

const handleClose = () => {
    emit('update:visible', false);
};

const handleConfirm = async () => {
    if (props.selectedIndices && props.selectedIndices?.length > 0) {
        await deleteBudgets(props.selectedIndices);
    }
};

const { mutateAsync: _deleteBudgets, isPending } = useBudgetDeleteMutation({});

const deleteBudgets = async (budgetIds: string[]) => {
    /**
     * 💭 We are not using the `onSuccess` callback of `useBudgetDeleteMutation`
     * because it would be triggered for each individual deletion, resulting in multiple success messages.
     * To avoid this, we handle the success logic after all deletions are completed using `Promise.all`.
     */
    try {
        await Promise.all(budgetIds.map((budgetId) => _deleteBudgets({
            budget_id: budgetId,
        })));
        emit('confirm');
        emit('update:visible', false);
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.DELETE_SUCCESS'), '');
    } catch (error: any) {
        showErrorMessage(error.code, error.message);
    }
};
</script>

<template>
    <p-button-modal :visible="props.visible"
                    size="sm"
                    theme-color="alert"
                    hide-body
                    :header-title="$t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_DELETE_DESC')"
                    :loading="isPending"
                    @confirm="handleConfirm"
                    @close="handleClose"
                    @cancel="handleClose"
    />
</template>
