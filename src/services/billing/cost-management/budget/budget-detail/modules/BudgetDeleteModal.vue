<template>
    <p-double-check-modal :visible="proxyVisible"
                          :header-title="title"
                          :sub-title="subTitle"
                          :verification-text="verificationText"
                          size="sm"
                          @confirm="handleConfirm"
                          @update:visible="handleUpdate"
    />
</template>

<script lang="ts">
import { PDoubleCheckModal } from '@spaceone/design-system';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import VueI18n from 'vue-i18n';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

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
        budgetId: {
            type: String,
            default: '',
        },
        budgetName: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: false,
            title: 'Delete Budget' as TranslateResult,
            subTitle: computed(() => `${props.budgetName} will be deleted permanently`),
            verificationText: computed(() => props.budgetName),
        });

        const deleteBudget = async () => {
            try {
                await SpaceConnector.client.costAnalysis.budget.delete({
                    budget_id: props.budgetId,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const handleConfirm = () => {
            const res = deleteBudget();
            if (res) {
                state.proxyVisible = false;
                emit('confirm');
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
