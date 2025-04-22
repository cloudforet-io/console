<script setup lang="ts">
import { PButtonModal } from '@cloudforet/mirinae';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';

interface Props {
    visible: boolean;
    budgetOnOffValue: boolean;
}

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    budgetOnOffValue: false,
});

const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
}>();

const setNotification = async () => {
    try {
        await budgetPageStore.updateBudgetNotifications({
            budget_id: budgetPageState.budgetData?.budget_id ?? '',
            notification: {
                ...budgetPageState.budgetData?.notification,
                state: !props.budgetOnOffValue ? 'ENABLED' : 'DISABLED',
            },
        }, 'budgetAlert');
    } catch (error) {
        ErrorHandler.handleError(error);
    }
};

const handleClose = () => {
    emit('update:visible', false);
};

const handleConfirm = () => {
    setNotification();
    emit('update:visible', false);
};
</script>

<template>
    <p-button-modal :visible="props.visible"
                    :header-title="$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.UPDATE_BUDGET_ALERT')"
                    size="sm"
                    @cancel="handleClose"
                    @close="handleClose"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div v-if="props.budgetOnOffValue">
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.BUDGET_ALERT_MODAL_DESC1') }}
            </div>
            <div v-else-if="!props.budgetOnOffValue">
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.BUDGET_ALERT_MODAL_DESC2') }}
            </div>
        </template>
    </p-button-modal>
</template>
