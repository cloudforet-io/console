<script setup lang="ts">
import { ref } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { BudgetDeleteParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/delete';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

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

const loading = ref<boolean>(false);

const handleClose = () => {
    emit('update:visible', false);
};

const handleConfirm = async () => {
    if (props.selectedIndices && props.selectedIndices?.length > 0) {
        await deleteBudgets(props.selectedIndices);
        emit('confirm');
        emit('update:visible', false);
    }
};

const deleteBudgets = async (budgetIds: string[]) => {
    try {
        loading.value = true;
        await Promise.all(budgetIds.map(async (budgetId) => {
            await SpaceConnector.clientV2.costAnalysis.budget.delete<BudgetDeleteParameters, BudgetModel>({
                budget_id: budgetId,
            });
        }));
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.DELETE_SUCCESS'), '');
    } catch (error: any) {
        ErrorHandler.handleError(error);
        showErrorMessage(error.code, error.message);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <p-button-modal :visible="props.visible"
                    size="sm"
                    theme-color="alert"
                    hide-body
                    :header-title="$t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_DELETE_DESC')"
                    :loading="loading"
                    @confirm="handleConfirm"
                    @close="handleClose"
                    @cancel="handleClose"
    />
</template>
