<script setup lang="ts">
import { PButtonModal } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useBudgetGetQuery } from '@/services/cost-explorer/composables/use-budget-get-query';
import { useBudgetSetNotificationMutation } from '@/services/cost-explorer/composables/use-budget-set-notification-mutation';


interface Props {
    visible: boolean;
    budgetOnOffValue: boolean;
    budgetId: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    budgetOnOffValue: false,
});

const { budgetData } = useBudgetGetQuery(props.budgetId);


const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
(e: 'update:budget-on-off-value', value: { value: boolean; modalVisible: boolean}): void;
}>();

const { mutate: setNotification, isPending: isSettingNotification } = useBudgetSetNotificationMutation({
    onSuccess: (_data, _variables, __mutationType) => {
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.UPDATE_SUCCESS', {
            data: __mutationType.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
        }), '');
    },
    onError: (error: any) => {
        showErrorMessage(error.code, error.message);
    },
    onSettled: () => {
        emit('update:visible', false);
    },
});

const handleClose = () => {
    emit('update:visible', true);
};

const handleConfirm = () => {
    setNotification({
        budget_id: props.budgetId,
        notification: {
            ...budgetData.value.notification,
            state: !props.budgetOnOffValue ? 'ENABLED' : 'DISABLED',
        },
        __mutationType: 'budgetAlert',
    });
};
</script>

<template>
    <p-button-modal :visible="props.visible"
                    :header-title="$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.UPDATE_BUDGET_ALERT')"
                    size="sm"
                    :loading="isSettingNotification"
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
