<template>
    <p-double-check-modal :visible="proxyVisible"
                          :header-title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.DELETE_BUDGET')"
                          :verification-text="verificationText"
                          modal-size="sm"
                          @confirm="handleConfirm"
                          @update:visible="handleUpdate"
    />
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import { PDoubleCheckModal } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';


export default {
    name: 'BudgetDetailDeleteModal',
    components: {
        PDoubleCheckModal,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const budgetPageStore = useBudgetDetailPageStore();
        const budgetPageState = budgetPageStore.$state;

        const state = reactive({
            proxyVisible: false,
            verificationText: computed(() => budgetPageState.budgetData?.name || ''),
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

        return {
            ...toRefs(state),
            handleConfirm,
            handleUpdate,
        };
    },
};
</script>
