<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDoubleCheckModal } from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useBudgetPageStore } from '@/services/cost-explorer/store/budget-page-store';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update', value: boolean): void;
    (e: 'confirm'): void;
}>();
const { t } = useI18n();

const budgetPageStore = useBudgetPageStore();
const budgetPageState = budgetPageStore.$state;

const state = reactive({
    proxyVisible: false,
    title: t('BILLING.COST_MANAGEMENT.BUDGET.FORM.DELETE_BUDGET'),
    verificationText: computed(() => budgetPageState.budgetData?.name),
});

const handleConfirm = async () => {
    try {
        await SpaceConnector.client.costAnalysis.budget.delete({
            budget_id: budgetPageState.budgetData?.budget_id,
        });
        state.proxyVisible = false;
        emit('confirm');
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const handleUpdate = (visible) => {
    state.proxyVisible = visible;
    emit('update', state.proxyVisible);
};

watch(() => props.visible, (visible) => {
    if (visible !== state.proxyVisible) {
        state.proxyVisible = visible;
    }
});

</script>

<template>
    <p-double-check-modal :visible="state.proxyVisible"
                          :header-title="state.title"
                          :verification-text="state.verificationText"
                          modal-size="sm"
                          @confirm="handleConfirm"
                          @update:visible="handleUpdate"
    />
</template>
