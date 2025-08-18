<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PDoubleCheckModal } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useBudgetDeleteMutation } from '@/services/cost-explorer/composables/use-budget-delete-mutation';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const router = useRouter();

interface Props {
    visible: boolean;
    budgetName: string;
    budgetId: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
    (e: 'confirm'): void;
}>();

const verificationText = computed<string>(() => props.budgetName);

const { mutate: deleteBudgets, isPending } = useBudgetDeleteMutation({
    onSuccess: () => {
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.DELETE_SUCCESS'), '');
    },
    onError: (error: any) => {
        showErrorMessage(error.code, error.message);
    },
    onSettled: () => {
        router.replace({ name: COST_EXPLORER_ROUTE.BUDGET._NAME });
    },
});

const handleUpdate = () => {
    emit('update:visible', false);
};
</script>

<template>
    <p-double-check-modal :visible="props.visible"
                          :header-title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.DELETE_BUDGET')"
                          :verification-text="verificationText"
                          modal-size="sm"
                          :loading="isPending"
                          @confirm="deleteBudgets({ budget_id: props.budgetId ?? '' })"
                          @cancel="handleUpdate"
                          @close="handleUpdate"
    />
</template>
