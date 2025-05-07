<script lang="ts" setup>
import { computed } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDoubleCheckModal } from '@cloudforet/mirinae';


import type { BudgetDeleteParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/delete';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';

interface Props {
    visible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
    (e: 'confirm'): void;
}>();

const verificationText = computed(() => budgetPageState.budgetData?.name || '');

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;


const handleConfirm = async () => {
    try {
        await SpaceConnector.clientV2.costAnalysis.budget.delete<BudgetDeleteParameters>({
            budget_id: budgetPageState.budgetData?.budget_id ?? '',
        });
        emit('update:visible', false);
        emit('confirm');
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.DELETE_SUCCESS'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const handleUpdate = () => {
    emit('update:visible', false);
};
</script>

<template>
    <p-double-check-modal :visible="props.visible"
                          :header-title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.DELETE_BUDGET')"
                          :verification-text="verificationText"
                          modal-size="sm"
                          @confirm="handleConfirm"
                          @cancel="handleUpdate"
                          @close="handleUpdate"
    />
</template>

