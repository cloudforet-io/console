<template>
    <p-double-check-modal :visible="proxyVisible"
                          :header-title="title"
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
import VueI18n from 'vue-i18n';

import { PDoubleCheckModal } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useBudgetDetailPageStore } from '@/services/cost-explorer/store/budget-detail-page-store';

import TranslateResult = VueI18n.TranslateResult;

export default {
    name: 'BudgetDeleteModal',
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
            title: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.DELETE_BUDGET') as TranslateResult,
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

        return {
            ...toRefs(state),
            handleConfirm,
            handleUpdate,
        };
    },
};
</script>
